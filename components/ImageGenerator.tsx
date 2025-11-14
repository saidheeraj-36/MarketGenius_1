
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';

interface ImageGeneratorProps {
    onImageGenerated: (imageUrl: string) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onImageGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [imageStyle, setImageStyle] = useState('None');
    const [orientation, setOrientation] = useState<'1:1' | '16:9' | '9:16'>('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) return;

        setIsLoading(true);
        setError('');
        
        const fullPrompt = imageStyle === 'None' ? prompt : `${prompt}, ${imageStyle} style`;

        try {
            const imageUrl = await generateImage(fullPrompt, orientation);
            onImageGenerated(imageUrl);
        } catch (err: any) {
            setError(err.message || 'Failed to generate image.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-4 bg-white">
            <h3 className="text-md font-semibold text-slate-700">Create image from description</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="image-prompt" className="sr-only">Description</label>
                    <textarea
                        id="image-prompt"
                        rows={4}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Example: An apple-shaped chair in sunlight lounge with a teddy bear sitting on it."
                        className="w-full text-sm p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div>
                    <label htmlFor="image-style" className="block text-sm font-medium text-slate-700 mb-1">Image style</label>
                    <select
                        id="image-style"
                        value={imageStyle}
                        onChange={(e) => setImageStyle(e.target.value)}
                        className="w-full text-sm p-2 border border-slate-300 bg-white rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option>None</option>
                        <option>Photorealistic</option>
                        <option>Digital Art</option>
                        <option>Van Gogh painting</option>
                        <option>Black and white</option>
                        <option>Fantasy</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="orientation" className="block text-sm font-medium text-slate-700 mb-1">Orientation</label>
                    <select
                        id="orientation"
                        value={orientation}
                        onChange={(e) => setOrientation(e.target.value as any)}
                        className="w-full text-sm p-2 border border-slate-300 bg-white rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="1:1">Square (1:1)</option>
                        <option value="16:9">Landscape (16:9)</option>
                        <option value="9:16">Portrait (9:16)</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !prompt}
                    className="w-full flex justify-center items-center bg-primary-600 text-white font-bold py-2 px-4 rounded-md hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
                >
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : 'Generate'}
                </button>
                {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            </form>
        </div>
    );
};

export default ImageGenerator;