


import React, { useState, useEffect, useRef } from 'react';
import { generateBrief, generateContent, generateImage } from '../services/geminiService';
import { BlogBrief, ContentType, ToneOfVoice } from '../types';
import KeywordInput from './KeywordInput';
import SeoSidebar from './SeoSidebar';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MarkdownToolbar from './MarkdownToolbar';

type Stage = 'initial' | 'briefing' | 'generating' | 'done';

const Modal: React.FC<{ children: React.ReactNode; onClose?: () => void; wide?: boolean }> = ({ children, onClose, wide = false }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div 
            className={`bg-white rounded-2xl shadow-2xl relative w-full ${wide ? 'max-w-4xl' : 'max-w-md'}`}
            onClick={(e) => e.stopPropagation()}
        >
            {onClose && (
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            )}
            {children}
        </div>
    </div>
);

const FileTextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const countWords = (str: string): number => {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
};


const ArticleEditor: React.FC = () => {
    const [stage, setStage] = useState<Stage>('initial');
    const [topic, setTopic] = useState('');
    const [brief, setBrief] = useState<BlogBrief | null>(null);
    const [isBriefLoading, setIsBriefLoading] = useState(false);

    // Editable brief fields
    const [title, setTitle] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [outline, setOutline] = useState('');
    const [wordCount, setWordCount] = useState('1500');
    const [tone, setTone] = useState<ToneOfVoice>(ToneOfVoice.FRIENDLY);

    const [article, setArticle] = useState('');
    const [isArticleLoading, setIsArticleLoading] = useState(false);
    const [articleLoadingMessage, setArticleLoadingMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [error, setError] = useState('');
    const [featureImage, setFeatureImage] = useState<string | null>(null);
    const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]);
    
    // Export functionality
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const resultContainerRef = useRef<HTMLDivElement>(null);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const articleBodyRef = useRef<HTMLTextAreaElement>(null);

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

    useEffect(() => {
        if (brief) {
            setTitle(brief.title);
            setKeywords(brief.keywords);
            setOutline(brief.outline);
        }
    }, [brief]);

    const handleTopicSubmit = async () => {
        if (!topic) return;
        setIsBriefLoading(true);
        setError('');
        try {
            const generatedBrief = await generateBrief(topic);
            setBrief(generatedBrief);
            setStage('briefing');
        } catch (err: any) {
            setError(err.message || 'Could not generate brief. Please try again.');
            setStage('initial');
            console.error(err);
        } finally {
            setIsBriefLoading(false);
        }
    };

    const handleRegenerateOutline = async () => {
        setIsBriefLoading(true);
        setError('');
        try {
            const regeneratedBrief = await generateBrief(topic);
            setBrief(prev => prev ? { ...prev, outline: regeneratedBrief.outline } : regeneratedBrief);
        } catch (err) {
            setError('Could not regenerate outline. Please try again.');
        } finally {
            setIsBriefLoading(false);
        }
    };

    const handleBriefSubmit = async () => {
        setIsArticleLoading(true);
        setStage('generating');
        setError('');
        setArticle('');
        
        try {
            setArticleLoadingMessage('Writing your draft...');
            const briefPayload = { outline, wordCount };
            const articleWithPlaceholders = await generateContent(
                ContentType.BLOG_POST_FROM_BRIEF,
                title,
                keywords.join(', '),
                tone,
                JSON.stringify(briefPayload) 
            );
            setArticle(articleWithPlaceholders);
    
            // Process images
            setArticleLoadingMessage('Scanning for image opportunities...');
            const imagePlaceholders = [...articleWithPlaceholders.matchAll(/^\[(?:IMAGE:)?\s*(.*?)\s*\]$/gm)];
    
            if (imagePlaceholders.length > 0) {
                let processedArticle = articleWithPlaceholders;
                const newImageUrls: string[] = [];
                for (let i = 0; i < imagePlaceholders.length; i++) {
                    const placeholder = imagePlaceholders[i][0]; // Full match, e.g., [IMAGE: desc]
                    const prompt = imagePlaceholders[i][1];     // Just the description
                    
                    setArticleLoadingMessage(`Generating image ${i + 1} of ${imagePlaceholders.length}: "${prompt}"`);
                    
                    const imageUrl = await generateImage(prompt, '16:9');
                    newImageUrls.push(imageUrl); // Collect new URLs for cleanup
                    const imageMarkdown = `\n\n![${prompt.replace(/\[|\]/g, '')}](${imageUrl})\n\n`;
                    
                    processedArticle = processedArticle.replace(placeholder, imageMarkdown);
                    setArticle(processedArticle); // Update state progressively
                }
                setGeneratedImageUrls(prev => [...prev, ...newImageUrls]);
            }
            
            setStage('done');
        } catch (err: any) {
            setError(err.message || 'Could not generate the article. Please try again.');
            setStage('briefing'); // Go back to brief editing on error
            console.error(err);
        } finally {
            setIsArticleLoading(false);
            setArticleLoadingMessage('');
        }
    };

    const handleFeatureImageGenerated = (imageUrl: string) => {
        setFeatureImage(imageUrl);
    };
    
    const getMarkdownContent = () => {
        const featureImageMd = featureImage ? `![Generated feature image](${featureImage})\n\n` : '';
        return `# ${title}\n\n${featureImageMd}${article}`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getMarkdownContent());
    };

    const handlePrintPdf = () => {
        const content = resultContainerRef.current?.innerHTML;
        if (!content) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Please allow popups to print the document.");
            return;
        }
        printWindow.document.write(`<html><head><title>Print - MarketGenius AI</title><script src="https://cdn.tailwindcss.com"></script><style>body { padding: 2rem; font-family: sans-serif; } .prose { max-width: 100% !important; } img { max-width: 100%; border-radius: 0.5rem; } </style></head><body><div class="prose prose-slate max-w-none">${content}</div></body></html>`);
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
        const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title><style>body{font-family: Arial, sans-serif;} h1,h2,h3,h4,h5,h6{font-weight: bold;} table{border-collapse: collapse;} td,th{border: 1px solid #ccc; padding: 8px;} img { max-width: 100%; height: auto; }</style></head><body>`;
        const footer = '</body></html>';
        const sourceHTML = header + content + footer;
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = 'article.doc';
        fileDownload.click();
        document.body.removeChild(fileDownload);
    };

    const showInitialModal = stage === 'initial' || (stage === 'briefing' && isBriefLoading);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 h-full flex flex-col overflow-hidden">
            {showInitialModal && (
                <Modal>
                    <div className="p-8">
                        <h2 className="text-xl font-bold text-slate-800 text-center">Create custom content</h2>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="flex items-center text-sm font-medium text-slate-700 mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                                    Create using
                                </label>
                                <input type="text" value="Topic" disabled className="w-full bg-slate-100 cursor-not-allowed px-3 py-2 border border-slate-300 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="topic-input" className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                                <input 
                                    id="topic-input"
                                    type="text" 
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., e-commerce"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleTopicSubmit}
                            disabled={isBriefLoading || !topic}
                            className="w-full mt-6 flex justify-center items-center bg-primary-600 text-white font-bold py-3 px-4 rounded-md hover:bg-primary-700 disabled:bg-slate-400"
                        >
                            {isBriefLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isBriefLoading ? 'Processing...' : 'Next'}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-3">Generating brief and outline. It may take 5-30 seconds.</p>
                        {error && !isBriefLoading && <p className="text-red-500 text-center text-sm mt-2">{error}</p>}
                    </div>
                </Modal>
            )}

            {stage === 'briefing' && brief && !isBriefLoading &&(
                <Modal onClose={() => setStage('initial')} wide>
                    <div className="flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 flex-shrink-0">
                             <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-800">Blog Brief & Outline</h2>
                                <button onClick={handleBriefSubmit} className="bg-primary-600 text-white font-bold py-2 px-5 rounded-md hover:bg-primary-700">Generate article</button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="title" className="text-sm font-medium text-slate-700">Title</label>
                                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Keywords</label>
                                        <KeywordInput keywords={keywords} setKeywords={setKeywords} />
                                    </div>
                                    <div>
                                        <label htmlFor="length" className="text-sm font-medium text-slate-700">Article length (words)</label>
                                        <input id="length" type="text" value={wordCount} onChange={e => setWordCount(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md" />
                                    </div>
                                    <div>
                                        <label htmlFor="tone" className="text-sm font-medium text-slate-700">Tone / Brand voice</label>
                                        <select id="tone" value={tone} onChange={e => setTone(e.target.value as ToneOfVoice)} className="w-full mt-1 px-3 py-2 border bg-white border-slate-300 rounded-md">
                                            {Object.values(ToneOfVoice).map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4 flex flex-col">
                                    <div className="flex justify-between items-center flex-shrink-0">
                                        <label htmlFor="outline" className="text-sm font-medium text-slate-700">Blog Outline</label>
                                        <button onClick={handleRegenerateOutline} disabled={isBriefLoading} className="text-xs text-primary-600 font-semibold flex items-center disabled:opacity-50">
                                            {isBriefLoading 
                                                ? <svg className="animate-spin h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                                : <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5" /></svg>
                                            }
                                            Regenerate blog outline
                                        </button>
                                    </div>
                                    <textarea id="outline" value={outline} onChange={e => setOutline(e.target.value)} className="w-full mt-1 flex-1 px-3 py-2 border border-slate-300 rounded-md font-mono text-sm leading-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {(stage === 'generating' || stage === 'done') ? (
                <div className="flex h-full w-full">
                    <SeoSidebar article={article} keywords={keywords} onImageGenerated={handleFeatureImageGenerated} />
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto relative bg-slate-100">
                        {isArticleLoading && stage === 'generating' && (
                             <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                                <svg className="animate-spin h-12 w-12 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <h2 className="text-2xl font-bold text-slate-700 mt-6">Generation in progress...</h2>
                                <p className="mt-2 text-sm max-w-sm">{articleLoadingMessage || 'Please check back this section in 1-2 minutes.'}</p>
                            </div>
                        )}
                        {stage === 'done' && (
                            <>
                                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                                    <div ref={resultContainerRef}>
                                        <ReactMarkdown>{getMarkdownContent()}</ReactMarkdown>
                                    </div>
                                </div>

                                <div className="absolute top-6 right-8 z-10 flex items-center space-x-2">
                                    <div className="bg-white p-1 rounded-md shadow-sm border border-slate-200 flex items-center space-x-1">
                                        <button 
                                            onClick={() => setIsEditing(false)} 
                                            className={`px-3 py-1 text-sm rounded ${!isEditing ? 'bg-primary-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            Preview
                                        </button>
                                        <button 
                                            onClick={() => setIsEditing(true)} 
                                            className={`px-3 py-1 text-sm rounded ${isEditing ? 'bg-primary-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            Editing
                                        </button>
                                    </div>
                                    <div className="relative" ref={exportMenuRef}>
                                        <button onClick={() => setIsExportMenuOpen(prev => !prev)} className="flex items-center text-sm font-medium bg-white border border-slate-200 shadow-sm text-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            Export
                                        </button>
                                        {isExportMenuOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-slate-200 z-20 py-1">
                                                <button onClick={() => { handleCopy(); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center">Copy Text</button>
                                                <button onClick={() => { handlePrintPdf(); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center">Download as PDF</button>
                                                <button onClick={() => { handleDownloadDocx(); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center">Download as DOCX</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white max-w-4xl mx-auto rounded-lg shadow-md h-full overflow-hidden flex flex-col">
                                {isEditing ? (
                                    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-y-auto">
                                        {/* Title Editor */}
                                        <div className="border border-slate-200 rounded-lg">
                                            <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                                <h3 className="font-semibold text-sm text-slate-600 flex items-center">
                                                    <FileTextIcon className="w-4 h-4 mr-2" />
                                                    Blog title
                                                </h3>
                                                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">{countWords(title)} words</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full p-4 border-0 focus:ring-0 text-xl font-bold text-slate-800"
                                                aria-label="Blog title editor"
                                            />
                                        </div>
                                        {/* Body Editor */}
                                        <div className="border border-slate-200 rounded-lg flex flex-col flex-1">
                                            <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
                                                <h3 className="font-semibold text-sm text-slate-600 flex items-center">
                                                    <FileTextIcon className="w-4 h-4 mr-2" />
                                                    Blog article body
                                                </h3>
                                                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">{countWords(article)} words</span>
                                            </div>
                                            <MarkdownToolbar textAreaRef={articleBodyRef} onContentChange={setArticle} />
                                            <textarea
                                                ref={articleBodyRef}
                                                value={article}
                                                onChange={(e) => setArticle(e.target.value)}
                                                className="w-full h-full p-4 border-0 focus:ring-0 leading-relaxed resize-none flex-1 min-h-[400px]"
                                                aria-label="Article body editor"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-a:text-primary-600 prose-strong:text-slate-700 prose-img:rounded-lg prose-img:shadow-md overflow-y-auto p-8 md:p-12">
                                        <ReactMarkdown
                                            components={{
                                                code(props) {
                                                    const {node, className, children, ...rest} = props;
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    return match ? (
                                                      <SyntaxHighlighter
                                                        PreTag="div"
                                                        language={match[1]}
                                                        style={vscDarkPlus as any}
                                                      >
                                                        {String(children).replace(/\n$/, '')}
                                                      </SyntaxHighlighter>
                                                    ) : (
                                                      <code className={className} {...rest}>
                                                        {children}
                                                      </code>
                                                    )
                                                }
                                            }}
                                        >
                                            {getMarkdownContent()}
                                        </ReactMarkdown>
                                    </div>
                                )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    <h2 className="text-2xl font-bold text-slate-600 mt-6">AI Writer</h2>
                    <p className="mt-2 max-w-md">Click the button below to start creating a new article brief and generate a long-form blog post.</p>
                    <button onClick={() => setStage('initial')} className="mt-6 bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700">
                        Generate New Article
                    </button>
                </div>
            )}
        </div>
    );
};

export default ArticleEditor;