



import React, { useState, useRef, useEffect } from 'react';
import { ContentType } from '../types';
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
  type?: 'text' | 'textarea';
}> = ({ label, id, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    {type === 'textarea' ? (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={6}
        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out font-mono text-sm"
      />
    ) : (
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
      />
    )}
  </div>
);

const SelectField: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
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
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const analysisFocusOptions = [
    'Overall Performance',
    'Channel Breakdown',
    'Audience Insights',
    'Creative Performance',
];

interface Metric {
    label: string;
    value: number;
    originalValue: string;
}

const parseMetrics = (text: string): Metric[] => {
    if (!text.trim()) return [];
    try {
        return text
            .split('\n')
            .map(line => {
                const parts = line.split(':');
                if (parts.length < 2) return null;

                const label = parts[0].trim();
                const valueStr = parts.slice(1).join(':').trim();
                
                const numericValue = parseFloat(valueStr.replace(/[$,%]/g, '').trim());

                if (isNaN(numericValue)) return null;

                return {
                    label,
                    value: numericValue,
                    originalValue: valueStr
                };
            })
            .filter((item): item is Metric => item !== null);
    } catch (error) {
        console.error("Error parsing metrics:", error);
        return [];
    }
};

const BarChart: React.FC<{ data: Metric[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const scaleFactor = maxValue === 0 ? 0 : 100 / maxValue;

    return (
        <div className="space-y-4 p-1">
            {data.map((item, index) => (
                <div key={index} className="grid grid-cols-12 items-center gap-x-4 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="col-span-3 text-right">
                        <span className="text-sm font-medium text-slate-600 truncate">{item.label}</span>
                    </div>
                    <div className="col-span-9">
                        <div className="w-full bg-slate-100 rounded-full h-7 relative group">
                            <div
                                className="bg-primary-500 h-7 rounded-full text-white text-xs flex items-center justify-end pr-3"
                                style={{ width: `${item.value * scaleFactor}%`, transition: 'width 0.5s ease-in-out' }}
                            >
                                <span className="font-bold drop-shadow-sm">{item.originalValue}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const CampaignAnalyst: React.FC = () => {
    const [campaignName, setCampaignName] = useState('');
    const [campaignObjective, setCampaignObjective] = useState('');
    const [keyMetrics, setKeyMetrics] = useState('');
    const [analysisFocus, setAnalysisFocus] = useState(analysisFocusOptions[0]);
    const [parsedMetrics, setParsedMetrics] = useState<Metric[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    
    const resultContainerRef = useRef<HTMLDivElement>(null);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const metrics = parseMetrics(keyMetrics);
        setParsedMetrics(metrics);
    }, [keyMetrics]);

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
            const generatedResult = await generateContent(
                ContentType.CAMPAIGN_REPORT,
                campaignName,
                keyMetrics,
                analysisFocus as any,
                campaignObjective
            );
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
        printWindow.document.write(`<html><head><title>Print - MarketGenius AI</title><script src="https://cdn.tailwindcss.com"></script><style>body { padding: 2rem; font-family: sans-serif; } .prose { max-width: 100% !important; }</style></head><body><div class="prose prose-slate max-w-none">${content.innerHTML}</div></body></html>`);
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
        fileDownload.download = 'campaign-analysis.doc';
        fileDownload.click();
        document.body.removeChild(fileDownload);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-slate-200 overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Campaign Details</h2>
                <p className="text-sm text-slate-500 mb-6">Enter your data to generate an analysis.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Campaign Name" id="campaignName" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="e.g., 'Q3 Summer Sale'" />
                    <InputField label="Campaign Objective" id="campaignObjective" value={campaignObjective} onChange={(e) => setCampaignObjective(e.target.value)} placeholder="e.g., 'Drive online sales by 20%'" />
                    <InputField label="Key Metrics Data" id="keyMetrics" type="textarea" value={keyMetrics} onChange={(e) => setKeyMetrics(e.target.value)} placeholder={`Spend: $5,000\nClicks: 15,234\nImpressions: 1,200,000\nCTR: 1.27%\nConversions: 305\nCVR: 2.00%\nCPA: $16.39`} />
                    <SelectField label="Analysis Focus" id="analysisFocus" value={analysisFocus} onChange={(e) => setAnalysisFocus(e.target.value)} options={analysisFocusOptions} />
                    <button type="submit" disabled={isLoading || !campaignName || !keyMetrics} className="w-full flex justify-center items-center bg-primary-600 text-white font-bold py-3 px-4 rounded-md hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300">
                        {isLoading ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2-2H4a2 2 0 01-2-2v-4z" /></svg>}
                        {isLoading ? 'Analyzing...' : 'Generate Report'}
                    </button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">Generated Report</h2>
                    {result && !isLoading && (
                        <div className="relative" ref={exportMenuRef}>
                            <button onClick={() => setIsExportMenuOpen(prev => !prev)} className="flex items-center text-sm font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export
                            </button>
                            {isExportMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-slate-200 z-20 py-1">
                                    <button onClick={() => { handleCopy(); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Copy Text</button>
                                    <button onClick={() => { handlePrintPdf(); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Download as PDF</button>
                                    <button onClick={() => { handleDownloadDocx(); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Download as DOCX</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex-1 bg-slate-50 rounded-lg p-4 overflow-y-auto">
                    {parsedMetrics.length > 0 && !result && !isLoading && (
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-700 mb-4 text-center">Live Data Visualization</h3>
                            <BarChart data={parsedMetrics} />
                        </div>
                    )}
                    <div ref={resultContainerRef} className="prose prose-slate max-w-none prose-headings:font-bold">
                        {isLoading && <div className="flex justify-center items-center h-full text-center text-slate-500"><svg className="animate-spin mx-auto h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="mt-3 font-medium">Turning data into a story...</p></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {!isLoading && !result && !parsedMetrics.length && <div className="flex justify-center items-center h-full text-center text-slate-500"><div><svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v17h16V4" /></svg><p className="mt-2 font-semibold">Your campaign analysis will appear here.</p></div></div>}
                        <ReactMarkdown
                            components={{
                                code(props) {
                                    const { children, className, node, ...rest } = props;
                                    const match = /language-(\w+)/.exec(className || '');
                                    return match ? (
                                        <SyntaxHighlighter
                                            PreTag="div"
                                            language={match[1]}
                                            style={vscDarkPlus as any}
                                        >
                                          {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className}>
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        >{result}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignAnalyst;
