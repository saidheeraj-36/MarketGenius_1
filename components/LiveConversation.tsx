
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAI_Blob } from '@google/genai';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { encode, decode, decodeAudioData } from '../services/geminiService';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

// Fix: `LiveSession` is not an exported member of `@google/genai`, using `any` for the session promise ref.
type LiveSession = any;

const LiveConversation: React.FC = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [error, setError] = useState<string | null>(null);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const stopConversation = useCallback(() => {
        console.log('Stopping conversation...');
        // Disconnect Script Processor
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current.onaudioprocess = null;
            scriptProcessorRef.current = null;
        }

        // Stop media stream tracks
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        
        // Stop any playing audio sources
        audioSourcesRef.current.forEach(source => {
            try { source.stop(); } catch (e) { /* ignore */ }
        });
        audioSourcesRef.current.clear();

        // Close session
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => {
                session.close();
                console.log('Live session closed.');
            }).catch(e => console.error("Error closing session:", e));
            sessionPromiseRef.current = null;
        }
        
        setConnectionState('disconnected');
    }, []);


    const startConversation = useCallback(async () => {
        if (connectionState !== 'disconnected') return;

        setConnectionState('connecting');
        setError(null);
        nextStartTimeRef.current = 0;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            if (!outputAudioContextRef.current) {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const outputNode = outputAudioContextRef.current.createGain();

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log('Live session opened.');
                        setConnectionState('connected');

                        if (!inputAudioContextRef.current) {
                            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        }
                        const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: GenAI_Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then(session => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(source);
                            });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            audioSourcesRef.current.forEach(source => source.stop());
                            audioSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError('An error occurred with the connection.');
                        setConnectionState('error');
                        stopConversation();
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('Live session closed by server.');
                        stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                },
            });
            sessionPromiseRef.current = sessionPromise;
        } catch (err: any) {
            console.error('Failed to start conversation:', err);
            setError('Could not access microphone or start session. Please check permissions.');
            setConnectionState('error');
        }
    }, [connectionState, stopConversation]);

    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            stopConversation();
        };
    }, [stopConversation]);

    const handleButtonClick = () => {
        if (connectionState === 'disconnected' || connectionState === 'error') {
            startConversation();
        } else {
            stopConversation();
        }
    };
    
    const getButtonState = () => {
        switch (connectionState) {
            case 'connecting':
                return { text: 'Connecting...', disabled: true, color: 'bg-yellow-500' };
            case 'connected':
                return { text: 'Stop Conversation', disabled: false, color: 'bg-red-500 hover:bg-red-600' };
            case 'error':
                return { text: 'Retry', disabled: false, color: 'bg-primary-600 hover:bg-primary-700' };
            case 'disconnected':
            default:
                return { text: 'Start Conversation', disabled: false, color: 'bg-primary-600 hover:bg-primary-700' };
        }
    };
    
    const buttonState = getButtonState();

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Live AI Conversation</h2>
            <p className="text-slate-500 mb-8 max-w-md">Speak directly with the Gemini model in real-time. Start the conversation and begin talking.</p>

            <div className="relative w-48 h-48 mb-8">
                <div className={`absolute inset-0 rounded-full bg-primary-100 ${connectionState === 'connected' ? 'animate-ping' : ''}`}></div>
                <div className={`relative w-full h-full rounded-full flex items-center justify-center transition-colors
                    ${connectionState === 'connected' ? 'bg-green-100' : 'bg-slate-100'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-20 w-20 transition-colors ${connectionState === 'connected' ? 'text-green-500' : 'text-slate-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            <button
                onClick={handleButtonClick}
                disabled={buttonState.disabled}
                className={`w-full max-w-xs text-white font-bold py-4 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${buttonState.color}`}
            >
                {buttonState.text}
            </button>
            
            <p className="text-sm text-slate-500 mt-4 capitalize">
                Status: {connectionState}
            </p>

            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
};

export default LiveConversation;
