
import React, { useState } from 'react';
import { SceneObject, ConsoleLog } from '../types';
import PropertiesPanel from './PropertiesPanel';
import AiAssistant from './AiAssistant';
import SnippetsPanel from './SnippetsPanel';
import { InspectIcon, WandIcon, CodeIcon } from './icons/CoreIcons';

interface RightSidebarProps {
  selectedObject: SceneObject | null;
  onUpdateObject: (object: SceneObject) => void;
  onCodeInsert: (code: string) => void;
  addLog: (log: ConsoleLog) => void;
  onCreateScript: (code: string) => void;
}

type Tab = 'properties' | 'ai' | 'snippets';

const RightSidebar: React.FC<RightSidebarProps> = (props) => {
    const [activeTab, setActiveTab] = useState<Tab>('properties');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'properties':
                return <PropertiesPanel 
                    selectedObject={props.selectedObject} 
                    onUpdateObject={props.onUpdateObject} 
                />;
            case 'ai':
                 return <AiAssistant 
                    onCodeInsert={props.onCodeInsert} 
                    addLog={props.addLog}
                    onCreateScript={props.onCreateScript}
                    selectedObject={props.selectedObject}
                    onUpdateObject={props.onUpdateObject}
                />;
            case 'snippets':
                 return <SnippetsPanel onCodeInsert={props.onCodeInsert} />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{tab: Tab, label: string, icon: React.ReactNode}> = ({ tab, label, icon }) => (
         <button 
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab 
                ? 'border-cyan-400 text-cyan-400' 
                : 'border-transparent text-gray-400 hover:bg-white/5'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <aside className="w-72 bg-[#16171C] flex-shrink-0 flex flex-col border-l border-white/10">
            <div className="flex-shrink-0 flex border-b border-white/10">
                <TabButton tab="properties" label="Properties" icon={<InspectIcon className="w-4 h-4"/>}/>
                <TabButton tab="ai" label="AI" icon={<WandIcon className="w-4 h-4"/>} />
                <TabButton tab="snippets" label="Snippets" icon={<CodeIcon className="w-4 h-4"/>} />
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                {renderTabContent()}
            </div>
        </aside>
    );
};

export default RightSidebar;