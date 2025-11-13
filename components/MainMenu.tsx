
import React from 'react';

interface MainMenuProps {
    onCreateProject: (templateId: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onCreateProject }) => {
    return (
        <div className="flex items-center justify-center h-screen bg-[#0D0E12] text-white">
            <div className="w-full max-w-4xl bg-[#16171C] border border-white/10 rounded-lg shadow-2xl shadow-cyan-500/10 flex flex-col overflow-hidden">
                <header className="p-8 border-b border-white/10 text-center">
                    <h1 className="font-black text-5xl text-white tracking-tighter">DSE</h1>
                    <p className="font-semibold text-gray-400 text-lg mt-1">Developer Studio Engine</p>
                </header>
                <main className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-cyan-400">New Project</h2>
                        <div className="space-y-3">
                            <TemplateButton title="Blank Project" description="A completely empty scene." onClick={() => onCreateProject('blank')} />
                            <TemplateButton title="Basic Scene" description="A starter scene with a player, camera, and light." onClick={() => onCreateProject('basic')} />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-600">Load Project</h2>
                        <div className="p-6 bg-black/20 rounded-md text-center text-gray-500">
                           <p>Loading from cloud is coming soon!</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const TemplateButton: React.FC<{title: string, description: string, onClick: () => void}> = ({ title, description, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full text-left p-4 bg-black/20 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/50 rounded-md transition-all duration-200 transform hover:scale-105"
    >
        <h3 className="font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
    </button>
);

export default MainMenu;
