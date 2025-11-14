import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';
import { createChat } from '../services/geminiService';
import { Chat } from '@google/genai';
import ReactMarkdown from 'react-markdown';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hello! I'm Gaim, your AI marketing strategist. How can I help you today?",
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const initializeChat = useCallback(() => {
    if (!chatRef.current) {
        chatRef.current = createChat();
    }
  }, []);

  useEffect(() => {
      if (isOpen) {
        initializeChat();
      }
  }, [isOpen, initializeChat]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        throw new Error("Chat not initialized");
      }
      const response = await chatRef.current.sendMessage({ message: userInput });
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ai', text: response.text },
      ]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTranscript = () => {
    return messages.map(msg => `${msg.sender === 'ai' ? 'Marvin' : 'User'}: ${msg.text}`).join('\n\n');
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(formatTranscript());
    setIsExportMenuOpen(false);
  };

  const handleDownloadTranscript = () => {
    const transcript = formatTranscript();
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marvin-chat-transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  return (
    <>
      <div className={`fixed bottom-8 right-8 transition-all duration-300 ${isOpen ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform hover:scale-110 transition-transform"
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
      </div>

      <div
        className={`fixed bottom-8 right-8 w-full max-w-sm h-full max-h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-primary-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Marvin, your AI Strategist</h3>
            <p className="text-xs opacity-80">Online</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative" ref={exportMenuRef}>
              <button onClick={() => setIsExportMenuOpen(prev => !prev)} className="p-1 rounded-full hover:bg-white/20" aria-label="Export chat">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
              {isExportMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-slate-200 z-20 py-1">
                  <button onClick={handleCopyTranscript} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center">
                    Copy Transcript
                  </button>
                  <button onClick={handleDownloadTranscript} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center">
                    Download .txt
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/20" aria-label="Close chat">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-xs md:max-w-sm px-4 py-2.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-primary-500 text-white rounded-br-none'
                      : 'bg-white text-slate-700 rounded-bl-none border border-slate-200'
                  }`}
                >
                  <div className="prose prose-sm max-w-none prose-p:my-0">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">AI</div>
                  <div className="px-4 py-3 bg-white rounded-2xl rounded-bl-none border border-slate-200">
                    <div className="flex items-center justify-center space-x-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-white rounded-b-2xl">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask a marketing question..."
              className="flex-1 w-full px-4 py-2 border border-slate-300 rounded-full focus:ring-primary-500 focus:border-primary-500 transition duration-150"
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-primary-600 text-white w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;