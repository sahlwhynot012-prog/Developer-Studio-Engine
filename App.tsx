
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SceneObject, ProjectFile, ConsoleLog, ProjectState, SaveStatus, InstanceType, GuiObject } from './types';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import MainView from './components/MainView';
import RightSidebar from './components/RightSidebar';
import MainMenu from './components/MainMenu';
import GuiRenderer from './components/GuiRenderer';
import { getTemplate } from './projectTemplates';
import { v4 as uuidv4 } from 'uuid';


export default function App() {
  const [projectState, setProjectState] = useState<ProjectState>('main-menu');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const [isPlayMode, setIsPlayMode] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);

  // FIX: Moved `addLog` before its usage in `useEffect` and `handleSave` to resolve block-scoped variable errors.
  const addLog = useCallback((log: ConsoleLog) => {
    setConsoleLogs(prev => [...prev, { ...log, timestamp: new Date().toLocaleTimeString() }]);
  }, []);

  // --- PROJECT LIFECYCLE ---
  const handleCreateProject = useCallback((templateId: string) => {
    const template = getTemplate(templateId);
    setFiles(template.files);
    setSceneObjects(template.sceneObjects);
    setConsoleLogs(template.logs);
    setActiveScriptId(template.activeScriptId);
    setSelectedObjectId(template.selectedObjectId);
    setProjectState('editor');
    setSaveStatus('unsaved');
  }, []);

  const handleReturnToMenu = () => {
    setProjectState('main-menu');
    setFiles([]);
    setSceneObjects([]);
    setConsoleLogs([]);
    setActiveScriptId(null);
    setSelectedObjectId(null);
  };

  // --- SAVE SYSTEM ---
  useEffect(() => {
    let autoSaveTimer: ReturnType<typeof setInterval>;
    let backupTimer: ReturnType<typeof setInterval>;

    if (projectState === 'editor' && saveStatus === 'auto-saving') {
      autoSaveTimer = setInterval(() => {
        addLog({ type: 'log', message: 'Project auto-saved.'});
      }, 10000); 

      backupTimer = setInterval(() => {
        addLog({ type: 'log', message: 'Project backup created.'});
      }, 60000);
    }

    return () => {
      clearInterval(autoSaveTimer);
      clearInterval(backupTimer);
    };
  }, [projectState, saveStatus, addLog]);
  
  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    addLog({ type: 'log', message: 'Saving project...'});
    setTimeout(() => {
        setSaveStatus('auto-saving');
        addLog({ type: 'log', message: 'Project saved. Auto-save enabled.'});
    }, 1000);
  }, [addLog]);
  
  // --- STATE DERIVATION & MEMOS ---
  const activeScript = useMemo(() => {
    if (!activeScriptId) return undefined;
    const findScript = (items: ProjectFile[]): ProjectFile | undefined => {
      for (const item of items) {
        if (item.id === activeScriptId) return item;
        if (item.children) {
          const found = findScript(item.children);
          if (found) return found;
        }
      }
    };
    return findScript(files);
  }, [activeScriptId, files]);

  const selectedObject = useMemo(() => 
    sceneObjects.find(obj => obj.id === selectedObjectId) || null,
    [selectedObjectId, sceneObjects]
  );
  
  // --- HANDLERS ---
  const handleSelectObject = useCallback((id: string | null) => {
    setSelectedObjectId(id);
  }, []);
  
  const handleUpdateObject = useCallback((updatedObject: SceneObject) => {
    setSceneObjects(prev => prev.map(obj => obj.id === updatedObject.id ? updatedObject : obj));
    setSaveStatus('unsaved');
  }, []);

  const handleFileSelect = useCallback((file: ProjectFile) => {
    // FIX: Corrected casing for 'Script' type to match InstanceType and prevent a logic bug.
    if (['Script', 'LocalScript', 'ModuleScript'].includes(file.type)) {
        setActiveScriptId(file.id);
    // FIX: Corrected casing for 'Folder' type to match InstanceType. This resolves a type comparison error.
    } else if (file.type !== 'Folder') {
        setSelectedObjectId(file.id);
    }
  }, []);
  
  const handleCodeChange = useCallback((newCode: string) => {
    setSaveStatus('unsaved');
    setFiles(currentFiles => {
      const findAndupdateFile = (items: ProjectFile[]): ProjectFile[] => {
          return items.map(file => {
              if (file.id === activeScriptId) {
                  return { ...file, content: newCode };
              }
              if (file.children) {
                  return { ...file, children: findAndupdateFile(file.children) };
              }
              return file;
          });
      }
      return findAndupdateFile(currentFiles);
    });
  }, [activeScriptId]);

  const clearLogs = useCallback(() => {
    setConsoleLogs([]);
  }, []);

    const handleFileDelete = useCallback((fileId: string) => {
        const deleteFile = (items: ProjectFile[]): ProjectFile[] => {
            return items.filter(item => {
                if (item.id === fileId) {
                    if (item.undeletable) {
                        addLog({ type: 'warn', message: `Cannot delete protected system folder: ${item.name}` });
                        return true;
                    }
                    // Also remove from scene if it's a scene object
                    // FIX: Corrected casing for 'Folder' type to match InstanceType. This resolves a type comparison error.
                    if (item.type !== 'Folder' && !item.type.endsWith('Script') && item.type !== 'asset') {
                        setSceneObjects(prev => prev.filter(obj => obj.id !== item.id));
                    }
                    return false;
                }
                if (item.children) {
                    item.children = deleteFile(item.children);
                }
                return true;
            });
        };
        setFiles(currentFiles => deleteFile(currentFiles));
        setSaveStatus('unsaved');
    }, [addLog]);

    const handleFileRename = useCallback((fileId: string, newName: string) => {
        const renameFile = (items: ProjectFile[]): ProjectFile[] => {
            return items.map(item => {
                if (item.id === fileId) {
                    if (item.unrenameable) {
                        addLog({ type: 'warn', message: `Cannot rename protected system folder: ${item.name}` });
                        return item;
                    }
                    // Also rename in scene objects
                    setSceneObjects(prev => prev.map(obj => obj.id === fileId ? {...obj, name: newName} : obj));
                    return { ...item, name: newName };
                }
                if (item.children) {
                    return { ...item, children: renameFile(item.children) };
                }
                return item;
            });
        };
        setFiles(currentFiles => renameFile(currentFiles));
        setSaveStatus('unsaved');
    }, [addLog]);

  // FIX: Moved `handleAddNewInstance` before `handleCreateScript` to resolve block-scoped variable error.
  const handleAddNewInstance = useCallback((parentId: string, type: InstanceType, content?: string) => {
    setSaveStatus('unsaved');
    const newId = `${type}-${uuidv4()}`;
    const newName = `${type}`;
    
    const newInstanceFile: ProjectFile = { id: newId, name: newName, type };

    // Create SceneObject for physical items
    if (['Part', 'Wedge', 'Cone', 'DirectionalLight', 'PointLight'].includes(type)) {
        const commonProps = {
            id: newId,
            name: newName,
            position: { x: 400, y: 300, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
        };
        let newSceneObject: SceneObject;
        if (['Part', 'Wedge', 'Cone'].includes(type)) {
            newSceneObject = { ...commonProps, type: type as 'Part' | 'Wedge' | 'Cone', color: '#cccccc' };
        } else {
            newSceneObject = { ...commonProps, type: type as 'DirectionalLight' | 'PointLight', color: '#ffffff', intensity: 1 };
        }
        setSceneObjects(prev => [...prev, newSceneObject]);
    }

    // Create specific file types
    if (type.endsWith('Script')) {
        newInstanceFile.content = content || `-- New ${type}\n`;
        setActiveScriptId(newId);
    } else if (type.startsWith('ScreenGui')) {
      newInstanceFile.children = [];
    }

    setFiles(currentFiles => {
        const newFiles = JSON.parse(JSON.stringify(currentFiles));
        const findAndAdd = (items: ProjectFile[]): boolean => {
            for (const item of items) {
                if (item.id === parentId) {
                    if (!item.children) item.children = [];
                    item.children.push(newInstanceFile);
                    return true;
                }
                if (item.children) {
                    if (findAndAdd(item.children)) return true;
                }
            }
            return false;
        }
        findAndAdd(newFiles);
        return newFiles;
    });

  }, []);

  const handleCreateScript = useCallback((code: string, type: 'Script' | 'LocalScript' | 'ModuleScript' = 'Script') => {
    addLog({ type: 'log', message: `AI Assistant: Creating new ${type}...` });
    handleAddNewInstance('server-script-service', type, code);
  }, [addLog, handleAddNewInstance]);


  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'F5') {
            e.preventDefault();
            setIsPlayMode(p => !p);
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (saveStatus === 'unsaved') handleSave();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveStatus, handleSave]);


  // --- RENDER LOGIC ---
  if (projectState !== 'editor') {
    return <MainMenu onCreateProject={handleCreateProject} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#0D0E12] font-sans overflow-hidden">
      <TopBar 
        isPlayMode={isPlayMode} 
        onTogglePlayMode={() => setIsPlayMode(p => !p)}
        onSave={handleSave}
        saveStatus={saveStatus}
        onReturnToMenu={handleReturnToMenu}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar 
          files={files} 
          onFileSelect={handleFileSelect} 
          selectedFileId={activeScriptId || selectedObjectId}
          onAddNewInstance={handleAddNewInstance}
          onFileDelete={handleFileDelete}
          onFileRename={handleFileRename}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <MainView
            files={files}
            sceneObjects={sceneObjects}
            selectedObjectId={selectedObjectId}
            onSelectObject={handleSelectObject}
            onUpdateObject={handleUpdateObject}
            isPlayMode={isPlayMode}
            code={activeScript?.content || ''}
            onCodeChange={handleCodeChange}
            activeScriptName={activeScript?.name}
          />
        </div>
        <RightSidebar 
          selectedObject={selectedObject} 
          onUpdateObject={handleUpdateObject} 
          onCodeInsert={handleCodeChange}
          addLog={addLog}
          onCreateScript={handleCreateScript}
        />
        {isPlayMode && <GuiRenderer files={files} />}
      </div>
    </div>
  );
}
