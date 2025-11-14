import React from 'react';

interface MarkdownToolbarProps {
    textAreaRef: React.RefObject<HTMLTextAreaElement>;
    onContentChange: (newContent: string) => void;
}

const ToolbarButton: React.FC<{ onClick: () => void; children: React.ReactNode; title: string }> = ({ onClick, children, title }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="px-2.5 py-1.5 rounded text-slate-700 hover:bg-slate-200 text-sm font-medium"
    >
        {children}
    </button>
);

const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ textAreaRef, onContentChange }) => {

    const applyStyle = (startTag: string, endTag: string = startTag) => {
        const textArea = textAreaRef.current;
        if (!textArea) return;

        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        const text = textArea.value;
        const selectedText = text.substring(start, end);
        const newText = `${text.substring(0, start)}${startTag}${selectedText}${endTag}${text.substring(end)}`;
        
        onContentChange(newText);

        // After state update, we need to re-focus and set selection
        setTimeout(() => {
            textArea.focus();
            textArea.selectionStart = start + startTag.length;
            textArea.selectionEnd = end + startTag.length;
        }, 0);
    };
    
    const applyBlockStyle = (tag: string) => {
        const textArea = textAreaRef.current;
        if (!textArea) return;

        const start = textArea.selectionStart;
        const text = textArea.value;
        // Find the start of the current line
        let lineStart = start;
        while(lineStart > 0 && text[lineStart - 1] !== '\n') {
            lineStart--;
        }
        
        const newText = `${text.substring(0, lineStart)}${tag}${text.substring(lineStart)}`;
        onContentChange(newText);

        // After state update, we need to re-focus and set selection
        setTimeout(() => {
            textArea.focus();
            textArea.selectionStart = start + tag.length;
            textArea.selectionEnd = start + tag.length;
        }, 0);
    };

    const applyList = () => {
        const textArea = textAreaRef.current;
        if (!textArea) return;
        
        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        const text = textArea.value;

        // find the start and end of the lines that contain the selection
        let lineStart = start;
        while(lineStart > 0 && text[lineStart - 1] !== '\n') {
            lineStart--;
        }
        let lineEnd = end;
        while(lineEnd < text.length && text[lineEnd] !== '\n' && text[lineEnd] !== '\r') {
            lineEnd++;
        }

        const selectedLinesText = text.substring(lineStart, lineEnd);
        const listified = selectedLinesText.split('\n').map(line => line.trim() ? `* ${line}` : line).join('\n');
        const newText = `${text.substring(0, lineStart)}${listified}${text.substring(lineEnd)}`;
        onContentChange(newText);

        setTimeout(() => { textArea.focus(); }, 0);
    };

    const applyLink = () => {
        const url = prompt("Enter the URL:");
        if (url) {
            applyStyle(`[`, `](${url})`);
        }
    };

    return (
        <div className="flex items-center space-x-1 p-1 bg-slate-100 border-b border-slate-200 rounded-t-md">
            <ToolbarButton onClick={() => applyBlockStyle('## ')} title="Heading 2">H2</ToolbarButton>
            <ToolbarButton onClick={() => applyBlockStyle('### ')} title="Heading 3">H3</ToolbarButton>
            <div className="w-px h-5 bg-slate-300 mx-1"></div>
            <ToolbarButton onClick={() => applyStyle('**')} title="Bold">Bold</ToolbarButton>
            <ToolbarButton onClick={() => applyStyle('*')} title="Italic">Italic</ToolbarButton>
            <div className="w-px h-5 bg-slate-300 mx-1"></div>
            <ToolbarButton onClick={applyLink} title="Link">Link</ToolbarButton>
            <ToolbarButton onClick={applyList} title="List">List</ToolbarButton>
        </div>
    );
};

export default MarkdownToolbar;
