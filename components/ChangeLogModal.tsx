
import React from 'react';

interface ChangeLogModalProps {
    onClose: () => void;
}

const ChangeLogModal: React.FC<ChangeLogModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="w-full max-w-2xl bg-[#16171C] border border-white/10 rounded-lg shadow-2xl shadow-cyan-500/20 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Change Log - v1.02</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">&times;</button>
                </header>
                <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <ChangeItem title="Project Lifecycle" description="Added a Main Menu to create projects from templates. Implemented a robust Save System with auto-save and backup timers." />
                    <ChangeItem title="Scene ViewPort" description="The scene editor is now a 3D viewport with switchable 1st and 3rd person camera modes for more immersive editing." />
                    <ChangeItem title="New Scene Objects" description="You can now add primitive parts like Wedges and Cones, as well as Point Lights for more dynamic lighting." />
                    <ChangeItem title="AI Texture Generation" description="The AI Assistant can now generate seamless textures from a text prompt and apply them directly to scene objects." />
                    <ChangeItem title="UI Overhaul" description="The UI is now more powerful with interactive dropdown menus, a tabbed right sidebar, and a new 'Snippets' panel to quickly add common code." />
                    <ChangeItem title="File Hierarchy Upgrades" description="Added the ability to add new objects directly from the hierarchy panel, and a search bar to quickly find any file or object." />
                </main>
            </div>
        </div>
    );
};

const ChangeItem: React.FC<{title: string, description: string}> = ({ title, description }) => (
    <div>
        <h3 className="font-semibold text-cyan-400">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
);

export default ChangeLogModal;