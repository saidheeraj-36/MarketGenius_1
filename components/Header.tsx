

import React from 'react';
import { View } from '../App';
import { Tool } from './AIContentAssistant';

interface HeaderProps {
    activeView: View;
    activeTool: Tool | null;
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


const Header: React.FC<HeaderProps> = ({ activeView, activeTool }) => {
  const details = activeView === 'tool_runner' && activeTool
    ? { title: activeTool.title, subtitle: activeTool.description }
    : viewDetails[activeView];

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
        <div className="flex items-center">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src="https://picsum.photos/id/237/200/200"
            alt="User avatar"
          />
          <div className="ml-3 text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700">IIM Student</p>
            <p className="text-xs text-slate-500">Marketing GenAI Course</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;