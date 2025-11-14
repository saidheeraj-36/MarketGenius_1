
import React, { useState } from 'react';
import { View } from '../App';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactElement;
  label: string;
  view: View;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ icon, label, view, isActive, isCollapsed, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full h-12 px-4 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-primary-500 text-white shadow-md'
        : 'text-slate-600 hover:bg-primary-100 hover:text-primary-700'
    }`}
  >
    <div className="flex-shrink-0 w-6 h-6">{icon}</div>
    {!isCollapsed && <span className="ml-4 font-medium text-sm tracking-wide">{label}</span>}
  </button>
);

// Fix: Define missing icon components
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const AssistantIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const ContentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const LiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ImageEditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const SpeechIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const SocialIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2v4z" /></svg>;
const BriefsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const StrategyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const AnalysisIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v17h16V4" /></svg>;


export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainNavItems: { icon: React.ReactElement; label: string; view: View }[] = [
    { icon: <DashboardIcon />, label: 'Dashboard', view: 'dashboard' },
    { icon: <AssistantIcon />, label: 'AI Assistant', view: 'assistant' },
    { icon: <ContentIcon />, label: 'AI Writer', view: 'content' },
  ];

  const creativeSuiteItems: { icon: React.ReactElement; label: string; view: View }[] = [
    { icon: <LiveIcon />, label: 'Live Conversation', view: 'live_chat' },
    { icon: <ImageIcon />, label: 'Image Generation', view: 'image_gen' },
    { icon: <ImageEditIcon />, label: 'Image Editor', view: 'image_edit' },
    { icon: <SpeechIcon />, label: 'Speech Generation', view: 'speech' },
  ];

  const analyticsNavItems: { icon: React.ReactElement; label: string; view: View }[] = [
    { icon: <SocialIcon />, label: 'Social Posts', view: 'social' },
    { icon: <BriefsIcon />, label: 'Content Briefs', view: 'briefs' },
    { icon: <StrategyIcon />, label: 'Strategy Planner', view: 'strategy' },
    { icon: <AnalysisIcon />, label: 'Campaign Analyst', view: 'analyst' },
  ];

  return (
    <nav
      className={`relative bg-white shadow-lg h-screen flex flex-col p-4 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center mb-8"
        style={{ paddingLeft: isCollapsed ? '0.2rem' : '0' }}
      >
        <svg
          className="w-8 h-8 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        {!isCollapsed && <span className="ml-2 text-xl font-bold text-slate-800">MarketGenius</span>}
      </div>

      <div className="flex-1 space-y-2">
        {mainNavItems.map(item => (
            <NavItem key={item.view} {...item} isActive={activeView === item.view} isCollapsed={isCollapsed} onClick={() => setActiveView(item.view)} />
        ))}
        <hr className="my-4 border-slate-200" />
        {!isCollapsed && <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Creative Suite</h3>}
        {creativeSuiteItems.map(item => (
            <NavItem key={item.view} {...item} isActive={activeView === item.view} isCollapsed={isCollapsed} onClick={() => setActiveView(item.view)} />
        ))}
        <hr className="my-4 border-slate-200" />
        {!isCollapsed && <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Analytics & Tools</h3>}
        {analyticsNavItems.map(item => (
            <NavItem key={item.view} {...item} isActive={activeView === item.view} isCollapsed={isCollapsed} onClick={() => setActiveView(item.view)} />
        ))}
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 bg-white border-2 border-slate-200 w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </nav>
  );
};
