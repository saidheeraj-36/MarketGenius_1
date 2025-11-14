import React, { useState, useEffect, useRef } from 'react';
import { editImage } from '../services/geminiService';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/png;base64,")
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

const ImageEditor: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [originalImage, setOriginalImage] = useState<{ file: File; url: string; base64: string; mimeType: string } | null>(null);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Cleanup object URL for the original uploaded image
        return () => {
            if (originalImage) URL.revokeObjectURL(originalImage.url);
        };
    }, [originalImage]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (originalImage) URL.revokeObjectURL(originalImage.url);
            setEditedImageUrl(null);
            
            const url = URL.createObjectURL(file);
            const base64 = await fileToBase64(file);
            setOriginalImage({ file, url, base64, mimeType: file.type });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt || !originalImage) return;

        setIsLoading(true);
        setError('');
        setEditedImageUrl(null);

        try {
            const newImageUrl = await editImage(prompt, originalImage.base64, originalImage.mimeType);
            setEditedImageUrl(newImageUrl);
        } catch (err: any) {
            setError(err.message || 'Failed to edit image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!editedImageUrl) return;
        const a = document.createElement('a');
        a.href = editedImageUrl;
        a.download = 'edited-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-slate-200 overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Image Editor</h2>
                <p className="text-sm text-slate-500 mb-6">Upload an image and describe your edits.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">1. Upload Image</label>
                        <div 
                            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md cursor-pointer hover:border-primary-500"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-slate-600">
                                    <p className="pl-1">{originalImage ? 'Click to change image' : 'Click to upload an image'}</p>
                                </div>
                                <p className="text-xs text-slate-500">{originalImage ? originalImage.file.name : 'PNG, JPG, GIF up to 10MB'}</p>
                            </div>
                        </div>
                        <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                    </div>
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-1">
                            2. Describe Your Edit
                        </label>
                        <textarea
                            id="prompt"
                            rows={4}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Add a retro filter. or Remove the person in the background."
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            disabled={!originalImage}
                        />
                    </div>
                    <button type="submit" disabled={isLoading || !prompt || !originalImage} className="w-full flex justify-center items-center bg-primary-600 text-white font-bold py-3 px-4 rounded-md hover:bg-primary-700 disabled:bg-slate-400">
                        {isLoading ? 'Editing...' : 'Generate Edit'}
                    </button>
                    {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                </form>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center justify-center h-full">
                <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg flex flex-col items-center justify-center relative p-2">
                        <h3 className="text-sm font-semibold text-slate-600 absolute top-2 left-2 bg-white/70 px-2 py-1 rounded-full">Original</h3>
                        {originalImage ? <img src={originalImage.url} alt="Original" className="max-w-full max-h-full object-contain rounded-md" /> : <p className="text-slate-500">Upload an image to start</p>}
                    </div>
                    <div className="bg-slate-50 rounded-lg flex flex-col items-center justify-center relative p-2">
                        <div className="absolute top-2 left-2 flex items-center space-x-2 z-10">
                            <h3 className="text-sm font-semibold text-slate-600 bg-white/70 px-2 py-1 rounded-full">Edited</h3>
                            {editedImageUrl && !isLoading && (
                                <button onClick={handleDownload} className="bg-white/70 p-1.5 rounded-full text-slate-600 hover:bg-white hover:text-primary-600 shadow-sm" aria-label="Download edited image">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {isLoading && <p className="text-slate-500">Generating...</p>}
                        {editedImageUrl && !isLoading && <img src={editedImageUrl} alt="Edited" className="max-w-full max-h-full object-contain rounded-md" />}
                        {!editedImageUrl && !isLoading && <p className="text-slate-500">Your edited image will appear here</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;