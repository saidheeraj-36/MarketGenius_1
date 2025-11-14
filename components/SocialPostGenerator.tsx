

import React, { useState, useRef, useEffect } from 'react';
import { ContentType, ToneOfVoice } from '../types';
import { generateContent } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const InputField: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
}> = ({ label, id, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { [key: string]: string };
}> = ({ label, id, value, onChange, options }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
    >
      {Object.entries(options).map(([key, val]) => (
        <option key={key} value={val}>{val}</option>
      ))}
    </select>
  </div>
);

const socialContentTypes = {
    [ContentType.TWEET_THREAD]: ContentType.TWEET_THREAD,
    [ContentType.LINKEDIN_POST]: ContentType.LINKEDIN_POST,
};

const SocialPostGenerator: React.FC = () => {
  const [contentType, setContentType] = useState<ContentType>(ContentType.TWEET_THREAD);
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState<ToneOfVoice>(ToneOfVoice.CASUAL);
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const resultContainerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      const generatedResult = await generateContent(contentType, topic, audience, tone, goal);
      setResult(generatedResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  const handlePrintPdf = () => {
    const content = resultContainerRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank');
     if (!printWindow) {
        alert("Please allow popups to print the document.");
        return;
    }

    printWindow.document.write(`
        <html>
            <head>
                <title>Print - MarketGenius AI</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { padding: 2rem; font-family: sans-serif; }
                    .prose { max-width: 100% !important; }
                </style>
            </head>
            <body>
                <div class="prose prose-slate max-w-none">
                    ${content.innerHTML}
                </div>
            </body>
        </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, 500);
  };

  const handleDownloadDocx = () => {
    const content = resultContainerRef.current?.innerHTML;
    if (!content) return;

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title><style>body{font-family: Arial, sans-serif;} h1,h2,h3,h4,h5,h6{font-weight: bold;} table{border-collapse: collapse;} td,th{border: 1px solid #ccc; padding: 8px;}</style></head><body>`;
    const footer = '</body></html>';
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'social-post.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-slate-200 overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Social Post Details</h2>
        <p className="text-sm text-slate-500 mb-6">Choose your platform and let AI do the writing.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectField
            label="Social Post Type"
            id="contentType"
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            options={socialContentTypes}
          />
          <InputField
            label="Topic"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'Top 5 marketing trends for 2024'"
          />
          <InputField
            label="Target Audience"
            id="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g., 'Digital marketers and founders'"
          />
          <SelectField
            label="Tone of Voice"
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value as ToneOfVoice)}
            options={ToneOfVoice}
          />
          <InputField
            label="Goal / CTA"
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., 'Encourage sharing and comments'"
          />
          <button
            type="submit"
            disabled={isLoading || !topic}
            className="w-full flex justify-center items-center bg-primary-600 text-white font-bold py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
            )}
            {isLoading ? 'Generating...' : 'Generate Social Post'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Generated Post</h2>
            {result && !isLoading && (
                 <div className="relative" ref={exportMenuRef}>
                 <button onClick={() => setIsExportMenuOpen(prev => !prev)} className="flex items-center text-sm font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-200 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                     </svg>
                     Export
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                         <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                     </svg>
                 </button>
                 {isExportMenuOpen && (
                     <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-slate-200 z-20 py-1">
                     <button onClick={() => { handleCopy(); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                         Copy Text
                     </button>
                     <button onClick={() => { handlePrintPdf(); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         Download as PDF
                     </button>
                     <button onClick={() => { handleDownloadDocx(); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         Download as DOCX
                     </button>
                     </div>
                 )}
             </div>
            )}
        </div>
        <div ref={resultContainerRef} className="flex-1 bg-slate-50 rounded-lg p-4 overflow-y-auto prose prose-slate max-w-none prose-headings:font-bold">
          {isLoading && (
            <div className="flex justify-center items-center h-full text-center">
                 <svg className="animate-spin mx-auto h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="mt-3 text-slate-600 font-medium">Crafting your viral post...</p>
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !result && (
             <div className="flex justify-center items-center h-full text-center text-slate-500">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2v4z" /></svg>
                  <p className="mt-2 font-semibold">Your generated social media post will appear here.</p>
                </div>
             </div>
          )}
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default SocialPostGenerator;