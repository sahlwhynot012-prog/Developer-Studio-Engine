
import React from 'react';

interface SnippetsPanelProps {
    onCodeInsert: (code: string) => void;
}

const snippets = [
    {
        name: 'Rotate on Update',
        code: `function onUpdate(object, deltaTime) {\n  object.rotation.y += 50 * deltaTime;\n}`
    },
    {
        name: 'Log on Click',
        code: `function onClick(object) {\n  console.log(object.name + ' was clicked!');\n}`
    },
    {
        name: 'Move with Keys (Simple)',
        code: `// Note: Player movement is already handled by default.\n// This is an example for a non-player object.\nfunction onUpdate(object, deltaTime) {\n  // Add keyboard input detection here\n}`
    },
     {
        name: 'Get Object by Name',
        code: `const otherObject = getObjectByName('ObjectName');\nif (otherObject) {\n  // do something with otherObject\n}`
    },
];

const SnippetsPanel: React.FC<SnippetsPanelProps> = ({ onCodeInsert }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 space-y-3 overflow-y-auto">
                <p className="text-xs text-gray-500">Click to insert a code snippet into the active script.</p>
                {snippets.map(snippet => (
                    <button 
                        key={snippet.name}
                        onClick={() => onCodeInsert(snippet.code)}
                        className="w-full text-left p-3 bg-black/20 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/50 rounded-md transition-all duration-200"
                    >
                        <h3 className="font-semibold text-sm text-white">{snippet.name}</h3>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SnippetsPanel;