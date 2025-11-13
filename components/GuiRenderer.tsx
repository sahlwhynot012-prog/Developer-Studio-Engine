import React from 'react';
import { ProjectFile } from '../types';

interface GuiRendererProps {
    files: ProjectFile[];
}

const findStarterGui = (files: ProjectFile[]): ProjectFile | undefined => {
    return files.find(f => f.id === 'starter-gui');
};

const GuiElement: React.FC<{ node: ProjectFile }> = ({ node }) => {
    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${(node.position?.x || 0) * 100}%`,
        top: `${(node.position?.y || 0) * 100}%`,
        width: `${node.size?.x || 100}px`,
        height: `${node.size?.y || 50}px`,
        transform: 'translate(-50%, -50%)',
        backgroundColor: node.backgroundColor,
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '14px',
    };

    return (
        <div style={style}>
            {node.type === 'TextButton' && node.text}
            {node.children && node.children.map(child => <GuiElement key={child.id} node={child} />)}
        </div>
    );
};


const GuiRenderer: React.FC<GuiRendererProps> = ({ files }) => {
    const starterGui = findStarterGui(files);
    
    if (!starterGui || !starterGui.children) {
        return null;
    }

    // A ScreenGui is the root, its children are rendered.
    const screenGuis = starterGui.children.filter(child => child.type === 'ScreenGui');

    return (
        <div className="absolute inset-0 pointer-events-none z-40">
            {screenGuis.map(screenGui => (
                <div key={screenGui.id} className="w-full h-full relative">
                    {screenGui.children?.map(childNode => (
                        <GuiElement key={childNode.id} node={childNode} />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default GuiRenderer;