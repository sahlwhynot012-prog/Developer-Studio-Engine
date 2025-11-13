
import React, { useRef, useEffect } from 'react';
import { ConsoleLog } from '../types';

interface BottomBarProps {
    logs: ConsoleLog[];
    onClear: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ logs, onClear }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getLogColor = (type: ConsoleLog['type']) => {
        switch(type) {
            case 'error': return 'text-red-400';
            case 'warn': return 'text-yellow-400';
            case 'log':
            default: return 'text-gray-400';
        }
    };
    
    return (
        <div className="h-32 bg-[#16171C] flex-shrink-0 border-t border-white/10 flex flex-col">
             <div className="flex items-center justify-between p-2 border-b border-white/10 flex-shrink-0">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Output</h2>
                <button onClick={onClear} className="text-xs text-gray-400 hover:text-white hover:bg-white/10 px-2 py-0.5 rounded-md transition-colors">
                    Clear
                </button>
            </div>
            <div ref={scrollRef} className="flex-1 p-2 overflow-y-auto font-mono text-xs">
                {logs.map((log, index) => (
                    <div key={index} className={`flex items-start ${getLogColor(log.type)}`}>
                        <span className="mr-2 text-gray-600 flex-shrink-0">{log.timestamp || '>'}</span>
                        <p className="whitespace-pre-wrap">{log.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BottomBar;