import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SceneObject, ProjectFile } from '../types';
import SceneView from './SceneView';
import CodeEditor from './CodeEditor';

interface MainViewProps {
    files: ProjectFile[];
    sceneObjects: SceneObject[];
    selectedObjectId: string | null;
    onSelectObject: (id: string | null) => void;
    onUpdateObject: (object: SceneObject) => void;
    isPlayMode: boolean;
    code: string;
    onCodeChange: (code: string) => void;
    activeScriptName?: string;
}

const MainView: React.FC<MainViewProps> = (props) => {
    const [topPanelHeight, setTopPanelHeight] = useState(60); // Initial height in percentage
    const isResizing = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isResizing.current = true;
        e.preventDefault();
    }, []);

    const handleMouseUp = useCallback(() => {
        isResizing.current = false;
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
        setTopPanelHeight(Math.max(10, Math.min(90, newHeight))); // Clamp between 10% and 90%
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);
    

    return (
        <div ref={containerRef} className="flex-1 bg-[#0D0E12] flex flex-col relative">
            <div className="min-h-0" style={{ height: `${topPanelHeight}%` }}>
               <SceneView {...props} />
            </div>
            <div 
                onMouseDown={handleMouseDown}
                className="w-full h-2 bg-[#0D0E12] hover:bg-cyan-500/50 cursor-row-resize transition-colors duration-200 z-10 flex items-center justify-center"
            >
                <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
            </div>
            <div className="flex-1 min-h-0">
               <CodeEditor code={props.code} onCodeChange={props.onCodeChange} activeScriptName={props.activeScriptName} />
            </div>
        </div>
    );
};

export default MainView;