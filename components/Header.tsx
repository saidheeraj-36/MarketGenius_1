

import React, { useState, useRef, useEffect } from 'react';
import { View } from '../App';
import { Tool } from './AIContentAssistant';

interface User {
  name: string;
  email: string;
}

interface HeaderProps {
    activeView: View;
    activeTool: Tool | null;
    user: User;
    onLogout: () => void;
}

const viewDetails: { [key in View]: { title: string; subtitle: string } } = {
    dashboard: { title: 'Dashboard', subtitle: 'Your marketing command center' },
    assistant: { title: 'AI Content Assistant', subtitle: 'Use the magic of AI to create amazing content and images' },
    content: { title: 'AI Writer', subtitle: 'Generate long-form articles with a guided workflow' },
    social: { title: 'Social Media Suite', subtitle: 'Craft viral posts in seconds' },
    briefs: { title: 'SEO Brief Architect', subtitle: 'Build data-driven content outlines' },
    strategy: { title: 'Strategy Planner', subtitle: 'Map out your next winning campaign' },
    analyst: { title: 'Campaign Performance Analyst', subtitle: 'Turn your campaign data into actionable stories' },
    tool_runner: { title: 'AI Tool', subtitle: 'Generating content with a specialized AI assistant' },
    coming_soon: { title: 'Coming Soon', subtitle: 'This feature is under construction' },
    image_gen: { title: 'AI Image Playground', subtitle: 'Generate stunning visuals from your imagination' },
    image_edit: { title: 'AI Image Editor', subtitle: 'Modify and enhance your images with text prompts' },
    speech: { title: 'AI Speech Generator', subtitle: 'Create high-quality audio from text' },
    live_chat: { title: 'Live Conversation', subtitle: 'Speak directly with your AI assistant in real-time' }
};


const Header: React.FC<HeaderProps> = ({ activeView, activeTool, user, onLogout }) => {
  const details = activeView === 'tool_runner' && activeTool
    ? { title: activeTool.title, subtitle: activeTool.description }
    : viewDetails[activeView];
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-slate-200 flex-shrink-0">
      <div>
        <h1 className="text-xl font-bold text-slate-800">{details.title}</h1>
        <p className="text-sm text-slate-500">{details.subtitle}</p>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
        </button>
        <div className="relative" ref={menuRef}>
          <div className="flex items-center cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt="User avatar"
            />
            <div className="ml-3 text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">{user.name}</p>
              <p className="text-xs text-slate-500">GAIM Course</p>
            </div>
          </div>
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-slate-200 z-20 py-1">
              <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                 </svg>
                 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
