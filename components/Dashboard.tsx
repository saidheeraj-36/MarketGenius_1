
import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { generateMarketingTip } from '../services/geminiService';

interface DashboardProps {
  setActiveView: (view: View) => void;
}

const StatCard: React.FC<{ icon: React.ReactElement; value: string; label: string; color: string }> = ({ icon, value, label, color }) => (
  <div className={`bg-white p-6 rounded-xl shadow-md border border-slate-200 flex items-center space-x-4`}>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
    const [tip, setTip] = useState('');
    const [isTipLoading, setIsTipLoading] = useState(true);

    const fetchTip = async () => {
        setIsTipLoading(true);
        const newTip = await generateMarketingTip();
        setTip(newTip);
        setIsTipLoading(false);
    };

    useEffect(() => {
        fetchTip();
    }, []);

  const stats = [
    {
      icon: <ContentIcon />,
      value: '128',
      label: 'Content Generated',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <StrategyIcon />,
      value: '14',
      label: 'Campaigns Planned',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: <SocialIcon />,
      value: '452',
      label: 'Social Posts Crafted',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const quickStarts = [
    {
        icon: <ContentGenIcon />,
        label: 'Create Content',
        view: 'content' as View,
        color: 'hover:bg-blue-50 border-blue-200 text-blue-700'
    },
    {
        icon: <SocialGenIcon />,
        label: 'Draft Social Post',
        view: 'social' as View,
        color: 'hover:bg-purple-50 border-purple-200 text-purple-700'
    },
    {
        icon: <StrategyGenIcon />,
        label: 'Plan Strategy',
        view: 'strategy' as View,
        color: 'hover:bg-green-50 border-green-200 text-green-700'
    }
  ]

  const recentActivity = [
    { type: 'Blog Post', title: 'The Future of AI in Marketing', time: '2 hours ago'},
    { type: 'Tweet Thread', title: '5 Quick Tips for Better Engagement', time: 'Yesterday'},
    { type: 'SEO Brief', title: 'Guide to Core Web Vitals', time: 'Yesterday'},
    { type: 'LinkedIn Post', title: 'Why Company Culture Matters for Marketing', time: '3 days ago'},
    { type: 'Marketing Strategy', title: 'Q4 Product Launch Campaign', time: '4 days ago'},
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Welcome back! 👋</h1>
        <p className="text-md text-slate-500 mt-1">Here's your marketing command center for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Start</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickStarts.map(qs => (
                    <button key={qs.view} onClick={() => setActiveView(qs.view)} className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center text-center transition-all duration-200 ${qs.color}`}>
                        {qs.icon}
                        <span className="font-semibold text-sm mt-2">{qs.label}</span>
                    </button>
                ))}
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-slate-800">Tip of the Day</h2>
                <button onClick={fetchTip} disabled={isTipLoading} className="text-slate-400 hover:text-primary-600 disabled:opacity-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isTipLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5" />
                    </svg>
                </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
                {isTipLoading ? (
                     <div className="text-center text-slate-500">
                        <svg className="animate-spin mx-auto h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="text-sm mt-2">Fetching wisdom...</p>
                    </div>
                ) : (
                    <p className="text-center text-slate-600 italic">"{tip}"</p>
                )}
            </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h2>
        <div className="space-y-3">
            {recentActivity.map(activity => (
                <div key={activity.title} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                            <ActivityIcon type={activity.type}/>
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-slate-700">{activity.title}</p>
                            <p className="text-xs text-slate-500">{activity.type}</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Icons
const ContentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const StrategyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const SocialIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2v4z" /></svg>;

const ContentGenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>
const SocialGenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" /></svg>
const StrategyGenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>

const ActivityIcon: React.FC<{type: string}> = ({type}) => {
    switch (type) {
        case 'Blog Post': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
        case 'Tweet Thread': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2v4z" /></svg>;
        case 'SEO Brief': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
        case 'LinkedIn Post': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx={4} cy={4} r={2} /></svg>;
        case 'Marketing Strategy': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
        default: return null;
    }
};

export default Dashboard;