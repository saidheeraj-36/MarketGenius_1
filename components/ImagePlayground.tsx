import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/geminiService';

const ImagePlayground: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) return;

        setIsLoading(true);
        setError('');
        setImageUrl(null);

        try {
            const newImageUrl = await generateImage(prompt, aspectRatio);
            setImageUrl(newImageUrl);
        } catch (err: any) {
            setError(err.message || 'Failed to generate image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!imageUrl) return;
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `${prompt.slice(0, 30).replace(/\s/g, '_') || 'generated-image'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-slate-200 overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Image Details</h2>
                <p className="text-sm text-slate-500 mb-6">Describe the image you want to create.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-1">
                            Prompt
                        </label>
                        <textarea
                            id="prompt"
                            rows={6}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A photorealistic image of a golden retriever wearing sunglasses on a beach."
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-700 mb-1">
                            Aspect Ratio
                        </label>
                        <select
                            id="aspectRatio"
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="1:1">Square (1:1)</option>
                            <option value="16:9">Landscape (16:9)</option>
                            <option value="9:16">Portrait (9:16)</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !prompt}
                        className="w-full flex justify-center items-center bg-primary-600 text-white font-bold py-3 px-4 rounded-md hover:bg-primary-700 disabled:bg-slate-400"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                        )}
                        {isLoading ? 'Generating...' : 'Generate Image'}
                    </button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center justify-center h-full">
                <div className="w-full h-full bg-slate-50 rounded-lg flex items-center justify-center relative overflow-hidden group">
                    {isLoading && (
                        <div className="text-center text-slate-500">
                             <svg className="animate-spin mx-auto h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="mt-3 font-medium">Painting your masterpiece...</p>
                        </div>
                    )}
                    {error && <p className="text-red-500 px-4 text-center">{error}</p>}
                    {!isLoading && !imageUrl && (
                        <div className="text-center text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="mt-2 font-semibold">Your generated image will appear here.</p>
                        </div>
                    )}
                    {imageUrl && (
                        <>
                            <img src={imageUrl} alt={prompt} className="max-w-full max-h-full object-contain" />
                            <div className="absolute top-4 right-4">
                                <button onClick={handleDownload} className="bg-white/80 p-2 rounded-full text-slate-700 hover:bg-white hover:text-primary-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Download image">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImagePlayground;