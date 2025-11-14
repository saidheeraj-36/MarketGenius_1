
import React, { useState, useEffect } from 'react';
// Fix: Use named import for Sidebar as it doesn't have a default export.
import { Sidebar } from './components/Sidebar';
import Header from './components/Header';
import ArticleEditor from './components/ArticleEditor';
import SocialPostGenerator from './components/SocialPostGenerator';
import BriefGenerator from './components/BriefGenerator';
import StrategyGenerator from './components/StrategyGenerator';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import CampaignAnalyst from './components/CampaignAnalyst';
import AIContentAssistant, { Tool } from './components/AIContentAssistant';
import ToolRunner from './components/ToolRunner';
import ComingSoon from './components/ComingSoon';
import ImagePlayground from './components/ImagePlayground';
import ImageEditor from './components/ImageEditor';
import SpeechGenerator from './components/SpeechGenerator';
import LiveConversation from './components/LiveConversation';
import Signup from './components/Signup';


export type View = 'dashboard' | 'content' | 'social' | 'briefs' | 'strategy' | 'analyst' | 'assistant' | 'tool_runner' | 'coming_soon' | 'image_gen' | 'image_edit' | 'speech' | 'live_chat';

interface User {
  name: string;
  email: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>('assistant');
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [comingSoonFeature, setComingSoonFeature] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Check for user in localStorage on initial load
    try {
      const storedUser = localStorage.getItem('marketGeniusUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('marketGeniusUser');
    }
  }, []);

  useEffect(() => {
    // Reset active tool if we navigate away from the tool runner
    if (activeView !== 'tool_runner') {
      setActiveTool(null);
    }
    if (activeView !== 'coming_soon') {
        setComingSoonFeature(undefined);
    }
  }, [activeView]);

  const handleLogin = (name: string, email: string) => {
    const newUser = { name, email };
    localStorage.setItem('marketGeniusUser', JSON.stringify(newUser));
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('marketGeniusUser');
    setUser(null);
  };

  const handleLaunchTool = (tool: Tool) => {
    if (tool.linkedView) {
        if (tool.linkedView === 'coming_soon') {
            setComingSoonFeature(tool.title);
        }
        setActiveView(tool.linkedView);
        return;
    }
    setActiveTool(tool);
    setActiveView('tool_runner');
  };

  const handleBackToAssistant = () => {
    setActiveTool(null);
    setActiveView('assistant');
  };

  const renderView = () => {
    switch (activeView) {
      case 'assistant':
        return <AIContentAssistant setActiveView={setActiveView} onLaunchTool={handleLaunchTool} />;
      case 'tool_runner':
        if (activeTool) {
          return <ToolRunner tool={activeTool} onBack={handleBackToAssistant} />;
        }
        // Fallback to assistant if no tool is active
        setActiveView('assistant'); 
        return <AIContentAssistant setActiveView={setActiveView} onLaunchTool={handleLaunchTool} />;
      case 'content':
        return <ArticleEditor />;
      case 'social':
        return <SocialPostGenerator />;
      case 'briefs':
        return <BriefGenerator />;
      case 'strategy':
        return <StrategyGenerator />;
      case 'analyst':
        return <CampaignAnalyst />;
      case 'dashboard':
        return <Dashboard setActiveView={setActiveView} />;
      case 'image_gen':
        return <ImagePlayground />;
      case 'image_edit':
        return <ImageEditor />;
      case 'speech':
        return <SpeechGenerator />;
      case 'live_chat':
        return <LiveConversation />;
      case 'coming_soon':
        return <ComingSoon featureName={comingSoonFeature} />;
      default:
        return <Dashboard setActiveView={setActiveView} />;
    }
  };

  if (!user) {
    return <Signup onLogin={handleLogin} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen flex text-slate-800">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col h-screen">
        <Header activeView={activeView} activeTool={activeTool} user={user} onLogout={handleLogout} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {renderView()}
        </main>
      </div>
      <Chatbot />
    </div>
  );
};

export default App;
