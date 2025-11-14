import React, { useState, useRef } from 'react';
import { generateSpeech, decode, decodeAudioData } from '../services/geminiService';

const voices = ['Kore', 'Puck', 'Charon', 'Zephyr', 'Fenrir'];

const SpeechGenerator: React.FC = () => {
    const [text, setText] = useState('');
    const [voice, setVoice] = useState(voices[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text) return;

        setIsLoading(true);
        setError('');
        setAudioUrl(null);

        try {
            const base64Audio = await generateSpeech(text, voice);
            
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
            
            const wavBlob = bufferToWave(audioBuffer);
            const url = URL.createObjectURL(wavBlob);
            setAudioUrl(url);

        } catch (err: any) {
            setError(err.message || 'Failed to generate speech.');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to convert AudioBuffer to a WAV Blob
    const bufferToWave = (abuffer: AudioBuffer): Blob => {
        const numOfChan = abuffer.numberOfChannels;
        const length = abuffer.length * numOfChan * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);
        const channels = [];
        let i;
        let sample;
        let offset = 0;
        let pos = 0;
        
        // write WAVE header
        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8); // file length - 8
        setUint32(0x45564157); // "WAVE"
        setUint32(0x20746d66); // "fmt " chunk
        setUint32(16); // length = 16
        setUint16(1); // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2); // block-align
        setUint16(16); // 16-bit
        setUint32(0x61746164); // "data" - chunk
        setUint32(length - pos - 4); // chunk length

        function setUint16(data: number) {
            view.setUint16(pos, data, true);
            pos += 2;
        }

        function setUint32(data: number) {
            view.setUint32(pos, data, true);
            pos += 4;
        }

        // write PCM samples
        for (i = 0; i < abuffer.numberOfChannels; i++) {
            channels.push(abuffer.getChannelData(i));
        }

        while (pos < length) {
            for (i = 0; i < numOfChan; i++) {
                sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
                view.setInt16(pos, sample, true); // write 16-bit sample
                pos += 2;
            }
            offset++;
        }

        return new Blob([view], { type: 'audio/wav' });
    }
    
    const handleDownload = () => {
        if (!audioUrl) return;
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = `speech.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-slate-200 overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Speech Generation</h2>
                <p className="text-sm text-slate-500 mb-6">Convert your text into natural-sounding audio.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="text" className="block text-sm font-medium text-slate-700 mb-1">
                            Text to Convert
                        </label>
                        <textarea
                            id="text"
                            rows={8}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="e.g., Hello, welcome to the future of AI-powered content creation."
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="voice" className="block text-sm font-medium text-slate-700 mb-1">
                            Voice
                        </label>
                        <select
                            id="voice"
                            value={voice}
                            onChange={(e) => setVoice(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        >
                            {voices.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={isLoading || !text} className="w-full flex justify-center items-center bg-primary-600 text-white font-bold py-3 px-4 rounded-md hover:bg-primary-700 disabled:bg-slate-400">
                        {isLoading ? 'Generating...' : 'Generate Speech'}
                    </button>
                    {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                </form>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center justify-center h-full">
                <div className="w-full h-full bg-slate-50 rounded-lg flex items-center justify-center relative p-4">
                    {isLoading && <p className="text-slate-500">Generating audio...</p>}
                    {!isLoading && !audioUrl && <p className="text-slate-500 text-center">Your generated audio will appear here.</p>}
                    {audioUrl && (
                        <div className="w-full max-w-md">
                            <h3 className="text-lg font-semibold text-slate-700 text-center mb-4">Playback</h3>
                            <audio ref={audioRef} controls src={audioUrl} className="w-full">
                                Your browser does not support the audio element.
                            </audio>
                             <div className="text-center mt-4">
                                <button onClick={handleDownload} className="flex items-center justify-center mx-auto text-sm font-medium bg-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-300 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download WAV
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpeechGenerator;