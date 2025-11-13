import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ProjectFile, InstanceType } from '../types';
import { 
    FolderIcon, FileIcon, CubeIcon, LightIcon, PointLightIcon, ViewPortIcon, 
    PlayerIcon as PlayerFileIcon, WedgeIcon, ConeIcon, StarterPlayerIcon, 
    StarterGuiIcon, ReplicatedStorageIcon, ServerScriptServiceIcon, ModelIcon,
    ToolIcon, LocalScriptIcon, ModuleScriptIcon, RemoteEventIcon, ScreenGuiIcon,
    LightingIcon, AudioIcon, StarterPackIcon
} from './icons/ExplorerIcons';
import { PlusIcon } from './icons/CoreIcons';

interface LeftSidebarProps {
    files: ProjectFile[];
    onFileSelect: (file: ProjectFile) => void;
    selectedFileId: string | null;
    onAddNewInstance: (parentId: string, type: InstanceType) => void;
    onFileDelete: (fileId: string) => void;
    onFileRename: (fileId: string, newName: string) => void;
}

const getIcon = (file: ProjectFile, isOpen: boolean) => {
    switch(file.type) {
        // System Folders
        case 'Folder':
             switch(file.id) {
                case 'workspace': return <FolderIcon isOpen={isOpen} className="w-5 h-5 text-sky-400" />;
                case 'lighting': return <LightingIcon className="w-5 h-5 text-yellow-400" />;
                case 'replicated-storage': return <ReplicatedStorageIcon className="w-5 h-5 text-red-400" />;
                case 'server-script-service': return <ServerScriptServiceIcon className="w-5 h-5 text-indigo-400" />;
                case 'starter-player': return <StarterPlayerIcon className="w-5 h-5 text-blue-400" />;
                case 'starter-gui': return <StarterGuiIcon className="w-5 h-5 text-green-400" />;
                case 'starter-pack': return <StarterPackIcon className="w-5 h-5 text-teal-400" />;
                case 'assets-folder': return <FolderIcon isOpen={isOpen} className="w-5 h-5 text-gray-400" />;
                case 'audio-folder': return <AudioIcon className="w-5 h-5 text-pink-400" />;
                default: return <FolderIcon isOpen={isOpen} className="w-5 h-5 text-gray-400" />;
            }
        // Scripts
        case 'Script': return <FileIcon className="w-5 h-5 text-yellow-400" />;
        case 'LocalScript': return <LocalScriptIcon className="w-5 h-5 text-blue-300" />;
        case 'ModuleScript': return <ModuleScriptIcon className="w-5 h-5 text-orange-400" />;
        // Scene Objects
        case 'Part': return <CubeIcon className="w-5 h-5 text-purple-400" />;
        case 'ViewPort': return <ViewPortIcon className="w-5 h-5 text-gray-400" />;
        case 'DirectionalLight': return <LightIcon className="w-5 h-5 text-yellow-500" />;
        case 'PointLight': return <PointLightIcon className="w-5 h-5 text-orange-500" />;
        case 'Player': return <PlayerFileIcon className="w-5 h-5 text-green-400" />;
        case 'Wedge': return <WedgeIcon className="w-5 h-5 text-indigo-400" />;
        case 'Cone': return <ConeIcon className="w-5 h-5 text-rose-400" />;
        // Other Instances
        case 'Model': return <ModelIcon className="w-5 h-5 text-cyan-400" />;
        case 'Tool': return <ToolIcon className="w-5 h-5 text-lime-400" />;
        case 'RemoteEvent': return <RemoteEventIcon className="w-5 h-5 text-pink-500" />;
        case 'ScreenGui': return <ScreenGuiIcon className="w-5 h-5 text-green-500" />;
        default: return <FileIcon className="w-5 h-5 text-gray-400" />;
    }
};

const FOLDER_ADD_OPTIONS: Record<string, InstanceType[]> = {
    'workspace': ['Part', 'Wedge', 'Cone', 'Script', 'LocalScript', 'Folder', 'Model'],
    'lighting': ['DirectionalLight', 'PointLight'],
    'replicated-storage': ['RemoteEvent', 'ModuleScript', 'Folder', 'Model'],
    'server-script-service': ['Script', 'ModuleScript', 'Folder'],
    'starter-player-scripts': ['LocalScript', 'ModuleScript'],
    'starter-character-scripts': ['Script', 'LocalScript', 'ModuleScript'],
    'starter-gui': ['ScreenGui'],
    'starter-pack': ['Tool'],
    'assets-folder': ['Folder'],
    'audio-folder': ['Folder'], // In future, 'Sound'
    'default': ['Folder'],
};

const AddInstanceMenu: React.FC<{ parentId: string, onAdd: (type: InstanceType) => void, onClose: () => void }> = ({ parentId, onAdd, onClose }) => {
    const options = FOLDER_ADD_OPTIONS[parentId] || FOLDER_ADD_OPTIONS['default'];
    const menuRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={menuRef} className="absolute top-full right-0 z-50 bg-[#1a1b20] min-w-[180px] max-h-60 overflow-y-auto shadow-lg rounded-md border border-white/10 p-1 text-sm mt-1">
            {options.map(type => (
                <button key={type} onClick={() => onAdd(type)} className="w-full text-left px-3 py-1.5 rounded-sm hover:bg-white/10 flex items-center space-x-2">
                    {getIcon({id: '', name: '', type}, false)}
                    <span>{type}</span>
                </button>
            ))}
        </div>
    );
};

const FileTree: React.FC<{ 
    file: ProjectFile; 
    onFileSelect: (file: ProjectFile) => void; 
    level: number;
    selectedFileId: string | null;
    onContextMenu: (e: React.MouseEvent, file: ProjectFile) => void;
    onAddNewInstance: (parentId: string, type: InstanceType) => void;
}> = ({ file, onFileSelect, level, selectedFileId, onContextMenu, onAddNewInstance }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

    const isSelected = file.id === selectedFileId;
    const isFolder = file.type === 'Folder' || file.children;

    const handleClick = () => {
        if (isFolder) setIsOpen(!isOpen);
        onFileSelect(file);
    };
    
    const canAddChildren = isFolder && (FOLDER_ADD_OPTIONS[file.id] || FOLDER_ADD_OPTIONS['default']);

    return (
        <div>
            <div
                onClick={handleClick}
                onContextMenu={(e) => onContextMenu(e, file)}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                className={`flex items-center space-x-2 py-1.5 cursor-pointer rounded-md mx-2 transition-colors group relative ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/5'
                }`}
            >
                {getIcon(file, isOpen)}
                <span className="text-sm truncate select-none font-medium flex-1">{file.name}</span>
                 {canAddChildren && (
                    <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setIsAddMenuOpen(p => !p); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded mr-1">
                            <PlusIcon className="w-4 h-4"/>
                        </button>
                        {isAddMenuOpen && (
                            <AddInstanceMenu parentId={file.id} onClose={() => setIsAddMenuOpen(false)} onAdd={(type) => { onAddNewInstance(file.id, type); setIsAddMenuOpen(false); }} />
                        )}
                    </div>
                 )}
            </div>
            {isFolder && isOpen && file.children && (
                <div className="mt-1">
                    {file.children.map(child => (
                        <FileTree key={child.id} file={child} onFileSelect={onFileSelect} level={level + 1} selectedFileId={selectedFileId} onContextMenu={onContextMenu} onAddNewInstance={onAddNewInstance} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ContextMenu: React.FC<{
    file: ProjectFile;
    position: { x: number; y: number };
    onClose: () => void;
    onDelete: (id: string) => void;
    onRename: (id: string, name: string) => void;
}> = ({ file, position, onClose, onDelete, onRename }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
            onDelete(file.id);
        }
        onClose();
    };

    const handleRename = () => {
        const newName = window.prompt(`Enter new name for "${file.name}":`, file.name);
        if (newName && newName.trim() !== '') {
            onRename(file.id, newName.trim());
        }
        onClose();
    };

    return (
         <div ref={menuRef} style={{ top: position.y, left: position.x }} className="absolute z-50 bg-[#1a1b20] min-w-[160px] shadow-lg rounded-md border border-white/10 p-1 text-sm">
            <button onClick={handleRename} disabled={file.unrenameable} className="w-full text-left px-3 py-1.5 rounded-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">Rename</button>
            <button onClick={handleDelete} disabled={file.undeletable} className="w-full text-left px-3 py-1.5 rounded-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
        </div>
    )
}


const LeftSidebar: React.FC<LeftSidebarProps> = ({ files, onFileSelect, selectedFileId, onAddNewInstance, onFileDelete, onFileRename }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, file: ProjectFile } | null>(null);

    const handleContextMenu = useCallback((e: React.MouseEvent, file: ProjectFile) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, file });
    }, []);
    
    const systemFolderOrder = ['workspace', 'lighting', 'replicated-storage', 'server-script-service', 'starter-player', 'starter-gui', 'starter-pack', 'assets-folder', 'audio-folder'];

    const sortedFiles = useMemo(() => {
        return [...files].sort((a, b) => {
            const indexA = systemFolderOrder.indexOf(a.id);
            const indexB = systemFolderOrder.indexOf(b.id);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [files]);

    const filteredFiles = useMemo(() => {
        if (!searchTerm) return sortedFiles;
        
        const filter = (items: ProjectFile[]): ProjectFile[] => {
            const result: ProjectFile[] = [];
            for (const item of items) {
                if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    result.push(item);
                } else if (item.children) {
                    const filteredChildren = filter(item.children);
                    if (filteredChildren.length > 0) {
                        result.push({ ...item, children: filteredChildren });
                    }
                }
            }
            return result;
        };
        return filter(sortedFiles);

    }, [sortedFiles, searchTerm]);

    return (
        <aside className="w-72 bg-[#16171C] flex-shrink-0 flex flex-col border-r border-white/10">
            {contextMenu && <ContextMenu 
                file={contextMenu.file} 
                position={{x: contextMenu.x, y: contextMenu.y}} 
                onClose={() => setContextMenu(null)}
                onDelete={onFileDelete}
                onRename={onFileRename}
            />}
            <div className="p-3 border-b border-white/10 flex-shrink-0 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Project Hierarchy</h2>
            </div>
             <div className="p-2 border-b border-white/10">
                <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0D0E12] text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
            </div>
            <div className="flex-1 py-2 overflow-y-auto">
                {filteredFiles.map(file => (
                    <FileTree key={file.id} file={file} onFileSelect={onFileSelect} level={0} selectedFileId={selectedFileId} onContextMenu={handleContextMenu} onAddNewInstance={onAddNewInstance} />
                ))}
            </div>
        </aside>
    );
};

export default LeftSidebar;