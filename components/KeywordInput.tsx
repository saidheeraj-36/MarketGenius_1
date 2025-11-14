
import React, { useState } from 'react';

interface KeywordInputProps {
    keywords: string[];
    setKeywords: React.Dispatch<React.SetStateAction<string[]>>;
}

const KeywordInput: React.FC<KeywordInputProps> = ({ keywords, setKeywords }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            const newKeyword = inputValue.trim();
            if (newKeyword && !keywords.includes(newKeyword)) {
                setKeywords([...keywords, newKeyword]);
                setInputValue('');
            }
        }
    };

    const removeKeyword = (keywordToRemove: string) => {
        setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
    };

    return (
        <div className="w-full mt-1 flex flex-wrap items-center p-2 border border-slate-300 rounded-md">
            {keywords.map((keyword, index) => (
                <div key={index} className="flex items-center bg-primary-100 text-primary-800 text-sm font-medium mr-2 mb-1 px-2.5 py-1 rounded-full">
                    <span>{keyword}</span>
                    <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add keywords..."
                className="flex-grow p-1 text-sm border-0 focus:ring-0"
            />
        </div>
    );
};

export default KeywordInput;