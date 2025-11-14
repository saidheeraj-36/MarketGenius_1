
import React from 'react';

const ComingSoon: React.FC<{ featureName?: string }> = ({ featureName }) => (
    <div className="flex flex-col items-center justify-center h-full text-center bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h2 className="mt-6 text-2xl font-bold text-slate-800">Coming Soon!</h2>
        <p className="mt-2 text-slate-500 max-w-sm">{featureName || 'This feature'} is under construction. We're working hard to bring this feature to you.</p>
    </div>
);

export default ComingSoon;
