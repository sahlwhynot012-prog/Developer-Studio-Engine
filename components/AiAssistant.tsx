
import React, { useState, useRef } from 'react';
import { generateCode, generateTexture } from '../services/geminiService';
import { ConsoleLog, SceneObject } from '../types';
import { WandIcon, UndoIcon } from './icons/CoreIcons';

interface AiAssistantProps {
    onCodeInsert: (code: string) => void;
    addLog: (log: ConsoleLog) => void;
    onCreateScript: (code: string) => void;
    selectedObject: SceneObject | null;
    onUpdateObject: (object: SceneObject) => void;
}

type AITab = 'code' | 'texture';

const AiAssistant: React.FC<AiAssistantProps> = ({ onCodeInsert, addLog, onCreateScript, selectedObject, onUpdateObject }) => {
    const [activeTab, setActiveTab] = useState<AITab>('code');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const lastPrompt = useRef('');

    const handleSubmit = async (e: React.FormEvent, isRetry = false) => {
        e.preventDefault();
        const currentPrompt = isRetry ? lastPrompt.current : prompt.trim();
        if (!currentPrompt) return;

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');
        lastPrompt.current = currentPrompt;
        const task = activeTab === 'code' ? 'code' : 'texture';
        addLog({ type: 'log', message: `AI Assistant: Generating ${task} for prompt "${currentPrompt}"...` });

        try {
            const content = activeTab === 'code' 
                ? await generateCode(currentPrompt)
                : await generateTexture(currentPrompt);
            setGeneratedContent(content);
            addLog({ type: 'log', message: `AI Assistant: ${task} generated successfully.` });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            addLog({ type: 'error', message: `AI Assistant Error: ${errorMessage}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInsertCode = () => {
        if (generatedContent) {
            onCodeInsert(generatedContent);
            addLog({ type: 'log', message: `AI code inserted into current script.` });
        }
    }
    
    const handleCreateScript = () => {
        if (generatedContent) {
            onCreateScript(generatedContent);
        }
    }

    const handleApplyTexture = () => {
        if (selectedObject && generatedContent) {
            onUpdateObject({ ...selectedObject, texture: generatedContent });
            addLog({ type: 'log', message: `Texture applied to ${selectedObject.name}`});
        }
    };

    const handleUndo = () => {
        setGeneratedContent('');
        setError(null);
    }
    
    const renderCodeOutput = () => (
        <div className="flex-1 flex flex-col min-h-0 bg-[#0D0E12] rounded-lg overflow-hidden border border-white/10">
            <pre className="text-xs p-3 overflow-auto flex-1">
                <code className="language-javascript">{generatedContent}</code>
            </pre>
            <div className="grid grid-cols-2 gap-px bg-white/10">
                <button onClick={handleInsertCode} className="bg-[#16171C] text-white font-semibold py-2 hover:bg-green-700/50 transition-colors flex-shrink-0 text-sm">
                    Insert into Script
                </button>
                 <button onClick={handleCreateScript} className="bg-[#16171C] text-white font-semibold py-2 hover:bg-blue-700/50 transition-colors flex-shrink-0 text-sm">
                    Create New Script
                </button>
            </div>
        </div>
    );
    
    const renderTextureOutput = () => (
         <div className="flex-1 flex flex-col min-h-0 bg-[#0D0E12] rounded-lg overflow-hidden border border-white/10">
            <div className="p-2 flex-1 flex items-center justify-center">
                <img src={generatedContent} alt="Generated texture" className="max-w-full max-h-full object-contain rounded-md"/>
            </div>
            <button
                onClick={handleApplyTexture}
                disabled={!selectedObject}
                className="bg-[#16171C] text-white font-semibold py-2 hover:bg-purple-700/50 transition-colors flex-shrink-0 text-sm disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                {selectedObject ? `Apply to ${selectedObject.name}` : 'Select an object to apply'}
            </button>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex border-b border-white/10">
                {['code', 'texture'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab as AITab)} className={`flex-1 py-1.5 text-sm capitalize ${activeTab === tab ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/5'}`}>
                        {tab} Generator
                    </button>
                ))}
            </div>
            <div className="p-4 space-y-4 h-full flex flex-col overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={activeTab === 'code' ? "e.g., make the object rotate on Y axis" : "e.g., seamless medieval stone wall texture"}
                            className="w-full h-24 p-2 bg-[#0D0E12] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none border border-white/10"
                            disabled={isLoading}
                        />
                        {generatedContent && (
                            <button type="button" onClick={handleUndo} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-md">
                                <UndoIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="w-full bg-cyan-600 text-white font-semibold py-2 rounded-md hover:bg-cyan-700 transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_10px_rgba(0,242,254,0.3)]"
                    >
                        {isLoading ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Generate'}
                    </button>
                </form>
                
                {error && <div className="text-red-400 text-sm bg-red-900/50 p-2 rounded-md">
                    <p>{error}</p>
                    <button onClick={(e) => handleSubmit(e, true)} className="text-xs text-white underline mt-1">Try again</button>
                </div>}

                {generatedContent && (activeTab === 'code' ? renderCodeOutput() : renderTextureOutput())}
                
                {!generatedContent && !isLoading && !error && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                         <div className="w-16 h-16 border-2 border-dashed border-cyan-500/30 rounded-full flex items-center justify-center animate-pulse">
                            <WandIcon className="w-8 h-8 text-cyan-500/50" />
                         </div>
                        <p className="mt-4 text-sm">AI is ready to assist you.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiAssistant;