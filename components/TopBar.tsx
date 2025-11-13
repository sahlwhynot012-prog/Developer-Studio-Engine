
import React, { useState } from 'react';
import { PlayIcon, StopIcon, SaveIcon, InfoIcon } from './icons/CoreIcons';
import { SaveStatus } from '../types';
import ChangeLogModal from './ChangeLogModal';

interface TopBarProps {
    isPlayMode: boolean;
    onTogglePlayMode: () => void;
    onSave: () => void;
    saveStatus: SaveStatus;
    onReturnToMenu: () => void;
}

const DropdownMenu: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
    return (
        <div className="dropdown">
            <button className="px-3 py-1 hover:bg-white/10 rounded-md transition-colors">{label}</button>
            <div className="dropdown-content mt-2 right-0">
                {children}
            </div>
        </div>
    );
};


const TopBar: React.FC<TopBarProps> = ({ isPlayMode, onTogglePlayMode, onSave, saveStatus, onReturnToMenu }) => {
    const [isChangelogVisible, setIsChangelogVisible] = useState(false);
    
    const getSaveButton = () => {
        switch (saveStatus) {
            case 'unsaved':
                return <button onClick={onSave} className="flex items-center space-x-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors">
                    <SaveIcon className="h-4 w-4" /> <span>Save</span>
                </button>;
            case 'saving':
                return <div className="flex items-center space-x-2 px-3 py-1 bg-cyan-600 rounded-md">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Saving...</span>
                </div>;
            case 'auto-saving':
                 return <div className="flex items-center space-x-2 px-3 py-1 text-gray-400">
                    <SaveIcon className="h-4 w-4" /> <span>Auto-saving...</span>
                </div>;
            case 'saved':
                 return <div className="flex items-center space-x-2 px-3 py-1 text-gray-400">
                    <SaveIcon className="h-4 w-4" /> <span>Saved</span>
                </div>;
        }
    };
    
    return (
        <>
        <header className="flex items-center justify-between bg-[#16171C] text-gray-300 p-2 shadow-md z-30 flex-shrink-0 border-b border-white/10">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <span className="font-black text-xl text-white tracking-tighter">DSE</span>
                    <span className="font-semibold text-gray-400">Developer Studio Engine</span>
                </div>
                <div className="px-3 py-1 text-xs font-semibold text-cyan-300 bg-cyan-900/50 border border-cyan-500/30 rounded-full">
                    Project Alpha
                </div>
            </div>
            
            <div className="absolute left-1/2 -translate-x-1/2">
                 <button 
                    onClick={onTogglePlayMode}
                    className={`flex items-center space-x-2 px-6 py-1.5 rounded-md text-white font-semibold transition-all duration-200 ${isPlayMode ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} shadow-[0_0_15px_rgba(0,255,180,0.3)] transform hover:scale-105`}
                >
                    {isPlayMode ? <StopIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                    <span>{isPlayMode ? 'Stop' : 'Run'}</span>
                </button>
            </div>

            <div className="flex items-center space-x-1 text-sm">
                {getSaveButton()}
                 <DropdownMenu label="File">
                    <button onClick={onReturnToMenu}>New Project...</button>
                    <button onClick={onSave}>Save Project</button>
                    <button onClick={() => alert('Import feature coming soon!')}>Import Asset...</button>
                 </DropdownMenu>
                 <DropdownMenu label="Edit">
                    <button onClick={() => alert('Undo feature coming soon!')}>Undo</button>
                    <button onClick={() => alert('Redo feature coming soon!')}>Redo</button>
                 </DropdownMenu>
                <button onClick={() => setIsChangelogVisible(true)} className="p-2 hover:bg-white/10 rounded-md transition-colors"><InfoIcon className="h-5 w-5"/></button>
            </div>
        </header>
        {isChangelogVisible && <ChangeLogModal onClose={() => setIsChangelogVisible(false)} />}
        </>
    );
};

export default TopBar;