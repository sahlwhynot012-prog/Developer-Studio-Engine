
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SceneObject, ProjectFile, ConsoleLog, ProjectState, SaveStatus, InstanceType, ValueType, StringValue, NumberValue } from './types';
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
  
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null); // For scene interaction
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null); // For hierarchy interaction
  
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const [isPlayMode, setIsPlayMode] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);

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
    setSelectedFileId(template.selectedObjectId);
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
    setSelectedFileId(null);
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
  const findFileById = useCallback((items: ProjectFile[], id: string | null): ProjectFile | undefined => {
      if (!id) return undefined;
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findFileById(item.children, id);
          if (found) return found;
        }
      }
  }, []);

  const activeScript = useMemo(() => findFileById(files, activeScriptId), [activeScriptId, files, findFileById]);
  
  const selectedFile = useMemo(() => findFileById(files, selectedFileId), [selectedFileId, files, findFileById]);

  const selectedObject = useMemo(() => 
    sceneObjects.find(obj => obj.id === selectedObjectId) || null,
    [selectedObjectId, sceneObjects]
  );
  
  // --- HANDLERS ---
  const handleSelectObject = useCallback((id: string | null) => {
    setSelectedObjectId(id);
    setSelectedFileId(id); // Sync selection
  }, []);
  
  const handleUpdateObject = useCallback((updatedObject: SceneObject) => {
    setSceneObjects(prev => prev.map(obj => obj.id === updatedObject.id ? updatedObject : obj));
    setSaveStatus('unsaved');
  }, []);

  const handleFileSelect = useCallback((file: ProjectFile) => {
    setSelectedFileId(file.id);
    if (['Script', 'LocalScript', 'ModuleScript'].includes(file.type)) {
        setActiveScriptId(file.id);
    } else {
        // Check if it's a scene object to also select it in the viewport
        const isSceneObj = sceneObjects.some(obj => obj.id === file.id);
        if(isSceneObj) {
            setSelectedObjectId(file.id);
        } else {
            setSelectedObjectId(null); // It's a non-scene object like a Value
        }
    }
  }, [sceneObjects]);
  
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

    const handleFileDelete = useCallback((fileId: string) => {
        const deleteFileRecursive = (items: ProjectFile[]): ProjectFile[] => {
            return items.filter(item => {
                if (item.id === fileId) {
                    if (item.undeletable) {
                        addLog({ type: 'warn', message: `Cannot delete protected system folder: ${item.name}` });
                        return true; // Keep it
                    }
                    setSceneObjects(prev => prev.filter(obj => obj.id !== item.id));
                    if (selectedFileId === item.id) setSelectedFileId(null);
                    if (selectedObjectId === item.id) setSelectedObjectId(null);
                    if (activeScriptId === item.id) setActiveScriptId(null);
                    return false; // Delete it
                }
                if (item.children) {
                    item.children = deleteFileRecursive(item.children);
                }
                return true;
            });
        };
        setFiles(currentFiles => deleteFileRecursive(JSON.parse(JSON.stringify(currentFiles))));
        setSaveStatus('unsaved');
    }, [addLog, selectedFileId, selectedObjectId, activeScriptId]);

    const handleFileRename = useCallback((fileId: string, newName: string) => {
        const renameFile = (items: ProjectFile[]): ProjectFile[] => {
            return items.map(item => {
                if (item.id === fileId) {
                    if (item.unrenameable) {
                        addLog({ type: 'warn', message: `Cannot rename protected system folder: ${item.name}` });
                        return item;
                    }
                    setSceneObjects(prev => prev.map(obj => obj.id === fileId ? {...obj, name: newName} : obj));
                    return { ...item, name: newName };
                }
                if (item.children) {
                    return { ...item, children: renameFile(item.children) };
                }
                return item;
            });
        };
        setFiles(currentFiles => renameFile(JSON.parse(JSON.stringify(currentFiles))));
        setSaveStatus('unsaved');
    }, [addLog]);

  const handleAddNewInstance = useCallback((parentId: string, type: InstanceType, content?: string) => {
    setSaveStatus('unsaved');
    const newId = `${type}-${uuidv4()}`;
    const newName = `${type}`;
    
    const newInstanceFile: ProjectFile = { id: newId, name: newName, type };

    if (['Part', 'Wedge', 'Cone', 'DirectionalLight', 'PointLight'].includes(type)) {
        const commonProps = { id: newId, name: newName, position: { x: 400, y: 300, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } };
        let newSceneObject: SceneObject;
        if (['Part', 'Wedge', 'Cone'].includes(type)) {
            newSceneObject = { ...commonProps, type: type as 'Part' | 'Wedge' | 'Cone', color: '#cccccc' };
        } else {
            newSceneObject = { ...commonProps, type: type as 'DirectionalLight' | 'PointLight', color: '#ffffff', intensity: 1 };
        }
        setSceneObjects(prev => [...prev, newSceneObject]);
    } else if (type.endsWith('Script')) {
        newInstanceFile.content = content || `-- New ${type}\n`;
        setActiveScriptId(newId);
    } else if (type.endsWith('Value')) {
      if (type === 'NumberValue') (newInstanceFile as NumberValue).value = 0;
      if (type === 'StringValue') (newInstanceFile as StringValue).value = '';
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

  const handleUpdateFileValue = useCallback((fileId: string, value: string | number) => {
    setSaveStatus('unsaved');
    setFiles(currentFiles => {
        const findAndUpdate = (items: ProjectFile[]): ProjectFile[] => {
            return items.map(item => {
                if (item.id === fileId) {
                    return { ...item, value };
                }
                if (item.children) {
                    return { ...item, children: findAndUpdate(item.children) };
                }
                return item;
            });
        };
        return findAndUpdate(currentFiles);
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
          selectedFileId={selectedFileId}
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
          selectedFile={selectedFile}
          onUpdateObject={handleUpdateObject} 
          onUpdateFileValue={handleUpdateFileValue}
          onCodeInsert={handleCodeChange}
          addLog={addLog}
          onCreateScript={handleCreateScript}
        />
        {isPlayMode && <GuiRenderer files={files} />}
      </div>
    </div>
  );
}