import React, { useState, useMemo } from 'react';
import ImageGenerator from './ImageGenerator';

interface SeoSidebarProps {
    article: string;
    keywords: string[];
    onImageGenerated: (imageUrl: string) => void;
}

const countOccurrences = (text: string, word: string) => {
    if (!text || !word) return 0;
    const regex = new RegExp(word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
    return (text.match(regex) || []).length;
};

const SeoGauge: React.FC<{ score: number }> = ({ score }) => {
    const scoreToColor = (s: number) => {
        if (s < 40) return '#ef4444'; // red-500
        if (s < 75) return '#f97316'; // orange-500
        return '#22c55e'; // green-500
    };
    const color = scoreToColor(score);
    const radius = 40;
    // The path is a semi-circle, so its length is half a full circle's circumference.
    const arcLength = Math.PI * radius;
    // The offset controls how much of the stroke is visible.
    // An offset of 0 means the arc is fully visible.
    // An offset of arcLength means it's fully hidden.
    const offset = arcLength - (score / 100) * arcLength;

    return (
        <div className="relative flex items-center justify-center w-40 h-32 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <path
                    d="M 10,50 A 40,40 0 1,1 90,50"
                    className="text-slate-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    strokeLinecap="round"
                />
                <path
                    d="M 10,50 A 40,40 0 1,1 90,50"
                    strokeWidth="10"
                    strokeDasharray={arcLength}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke={color}
                    fill="transparent"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="text-4xl font-bold" style={{ color }}>{score}</span>
                <span className="text-xs font-medium text-slate-500 -mt-1">Score</span>
            </div>
        </div>
    );
};

const SeoSidebar: React.FC<SeoSidebarProps> = ({ article, keywords, onImageGenerated }) => {
    const [activeTab, setActiveTab] = useState<'seo' | 'image'>('seo');

    const stats = useMemo(() => {
        if (!article) return { words: 0, headings: 0, paragraphs: 0, sentences: 0, avgSentenceLength: 0, seoScore: 0 };
        const words = article.trim().split(/\s+/).filter(Boolean).length;
        const headings = (article.match(/^(#+)\s/gm) || []).length;
        const paragraphs = article.split('\n\n').filter(p => p.trim() !== '' && !p.trim().startsWith('#')).length;
        const sentences = (article.match(/[.?!]+/g) || []).length || 1;
        const avgSentenceLength = Math.round(words / sentences);
        
        // SEO score calculation
        const keywordDensityScore = keywords.reduce((acc, kw) => acc + Math.min(countOccurrences(article, kw) * 2, 15), 0); // Max 15 per keyword
        const lengthScore = Math.min(words / 15, 30); // 1500 words = 30 points
        const structureScore = Math.min((headings + paragraphs) / 2, 30);
        const readabilityScore = Math.max(0, 25 - Math.abs(avgSentenceLength - 18)); // Ideal is 18 words/sentence. Max 25 points.

        const seoScore = Math.min(Math.round(keywordDensityScore + lengthScore + structureScore + readabilityScore), 100);
        return { words, headings, paragraphs, sentences, avgSentenceLength, seoScore };
    }, [article, keywords]);

    const keywordCounts = useMemo(() => {
        return keywords.map(kw => ({
            keyword: kw,
            count: countOccurrences(article, kw),
            density: stats.words > 0 ? ((countOccurrences(article, kw) / stats.words) * 100) : 0,
        }));
    }, [article, keywords, stats.words]);

    return (
        <div className="w-full md:w-80 lg:w-96 bg-slate-50 border-l border-slate-200 h-full flex flex-col flex-shrink-0">
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('seo')}
                    className={`flex-1 p-3 text-sm font-semibold text-center transition-colors ${activeTab === 'seo' ? 'text-primary-600 border-b-2 border-primary-600 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    Brief + SEO
                </button>
                <button
                    onClick={() => setActiveTab('image')}
                    className={`flex-1 p-3 text-sm font-semibold text-center transition-colors ${activeTab === 'image' ? 'text-primary-600 border-b-2 border-primary-600 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    AI Images
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'seo' ? (
                    <div className="p-4 space-y-6">
                        <div>
                            <h3 className="text-md font-semibold text-slate-700 mb-2 text-center">SEO Score</h3>
                            <SeoGauge score={stats.seoScore} />
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <h3 className="text-md font-semibold text-slate-700 mb-3">Content Stats</h3>
                             <div className="grid grid-cols-2 gap-4 text-center">
                                 <div>
                                    <p className="text-xl font-bold">{stats.words}</p>
                                    <p className="text-xs text-slate-500">Words</p>
                                </div>
                                 <div>
                                    <p className="text-xl font-bold">{stats.headings}</p>
                                    <p className="text-xs text-slate-500">Headings</p>
                                </div>
                                 <div>
                                    <p className="text-xl font-bold">{stats.paragraphs}</p>
                                    <p className="text-xs text-slate-500">Paragraphs</p>
                                </div>
                                 <div>
                                    <p className="text-xl font-bold">{stats.avgSentenceLength}</p>
                                    <p className="text-xs text-slate-500">Avg. Sentence</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                             <div className="flex justify-between items-center mb-3">
                                <h3 className="text-md font-semibold text-slate-700">Keywords</h3>
                                <button className="text-slate-400 hover:text-slate-600" aria-label="Edit Keywords">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                                </button>
                             </div>
                             <div className="space-y-2">
                                {keywordCounts.length > 0 ? keywordCounts.map(kw => (
                                    <div key={kw.keyword} className="flex justify-between items-center text-sm">
                                        <p className="text-slate-600 truncate mr-2" title={kw.keyword}>{kw.keyword}</p>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <span className="text-slate-500 font-medium">{kw.count}</span>
                                            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md font-mono">{kw.density.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-500 text-center py-2">No keywords defined.</p>
                                )}
                             </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <h3 className="text-md font-semibold text-slate-700 mb-3">Readability</h3>
                            <p className="text-sm text-slate-600">Average sentence length is {stats.avgSentenceLength} words. Aim for 15-20 words for best readability.</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <h3 className="text-md font-semibold text-slate-700 mb-3">Links</h3>
                            <p className="text-sm text-slate-500">Link analysis is coming soon!</p>
                        </div>
                    </div>
                ) : (
                    <ImageGenerator onImageGenerated={onImageGenerated} />
                )}
            </div>
        </div>
    );
};

export default SeoSidebar;