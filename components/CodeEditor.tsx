import React from 'react';
import Editor from 'react-simple-code-editor';
import { CodeIcon } from './icons/CoreIcons';
declare const Prism: any;

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  activeScriptName?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange, activeScriptName }) => {
  const highlight = (code: string) => {
    if (typeof Prism !== 'undefined' && Prism.languages.lua) {
      return Prism.highlight(code, Prism.languages.lua, 'lua');
    }
    return code;
  };

  const editorRef = React.useRef<any>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const { value, selectionStart, selectionEnd } = textarea;
    
    // Auto-pairing
    const pairs: { [key: string]: string } = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
    if (Object.keys(pairs).includes(e.key)) {
        e.preventDefault();
        const start = value.substring(0, selectionStart);
        const end = value.substring(selectionEnd);
        const middle = value.substring(selectionStart, selectionEnd);
        const char = e.key;
        const closingChar = pairs[char];
        
        const newCode = `${start}${char}${middle}${closingChar}${end}`;
        onCodeChange(newCode);

        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        }, 0);
        return;
    }

    // Auto-indentation on Enter
    if (e.key === 'Enter') {
        e.preventDefault();
        const currentLine = value.substring(value.lastIndexOf('\n', selectionStart - 1) + 1, selectionStart);
        const indent = currentLine.match(/^\s*/)?.[0] || '';
        const newCode = `${value.substring(0, selectionStart)}\n${indent}${value.substring(selectionEnd)}`;
        onCodeChange(newCode);

        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + indent.length;
        }, 0);
        return;
    }
    
    // Toggle Comment (Ctrl + /) for Lua
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const lines = value.split('\n');
      const startLine = value.substring(0, selectionStart).split('\n').length - 1;
      const endLine = value.substring(0, selectionEnd).split('\n').length - 1;
      
      const isCommenting = !lines[startLine].trim().startsWith('--');
      
      for (let i = startLine; i <= endLine; i++) {
        if(isCommenting) {
          lines[i] = '--' + lines[i];
        } else {
          lines[i] = lines[i].replace(/^--/, '');
        }
      }
      onCodeChange(lines.join('\n'));
    }

    // Move line up/down (Alt + ArrowUp/Down)
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const lines = value.split('\n');
      const startLine = value.substring(0, selectionStart).split('\n').length - 1;

      if (e.key === 'ArrowUp' && startLine > 0) {
        [lines[startLine], lines[startLine - 1]] = [lines[startLine - 1], lines[startLine]];
        const newCode = lines.join('\n');
        onCodeChange(newCode);
        setTimeout(() => {
            const newCursorPos = value.lastIndexOf('\n', selectionStart-1) - (lines[startLine-1].length - (selectionStart - value.lastIndexOf('\n', selectionStart-1) - 1));
            textarea.selectionStart = textarea.selectionEnd = Math.max(0, newCursorPos);
        }, 0);
      } else if (e.key === 'ArrowDown' && startLine < lines.length - 1) {
        [lines[startLine], lines[startLine + 1]] = [lines[startLine + 1], lines[startLine]];
        onCodeChange(lines.join('\n'));
      }
    }
  };
  
  return (
    <div className="w-full h-full bg-[#16171C] text-white flex flex-col font-mono text-sm">
      <div className="flex-shrink-0 bg-black/20 p-2 text-gray-400 border-b border-white/10 flex items-center space-x-2">
        <CodeIcon className="w-5 h-5 text-cyan-400" />
        <span className="font-semibold text-sm">{activeScriptName || 'Code Editor'}</span>
      </div>
      <div className="flex-1 overflow-auto relative code-editor-container">
        <Editor
          ref={editorRef}
          value={code}
          onValueChange={onCodeChange}
          highlight={highlight}
          padding={10}
          className="editor"
          onKeyDown={handleKeyDown}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
            lineHeight: 1.5,
            backgroundColor: '#16171C'
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;