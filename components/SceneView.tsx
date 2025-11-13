import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { SceneObject, CameraMode, ProjectFile, LightObject } from '../types';
import { CubeIcon, ViewPortIcon, LightIcon, PlayerIcon, PointLightIcon, WedgeIcon, ConeIcon } from './icons/SceneObjectIcons';
import { ViewIcon } from './icons/CoreIcons';

interface SceneViewProps {
  files: ProjectFile[];
  sceneObjects: SceneObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (object: SceneObject) => void;
  isPlayMode: boolean;
}

const usePlayerMovement = (
    player: SceneObject | undefined, 
    onUpdateObject: (object: SceneObject) => void,
    bounds: { width: number, height: number }
) => {
    const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
    const gameLoopRef = useRef<number | null>(null);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => setKeysPressed(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
        const handleKeyUp = (e: KeyboardEvent) => setKeysPressed(prev => ({ ...prev, [e.key.toLowerCase()]: false }));

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        if (!player || player.type !== 'Player') return;

        const gameLoop = () => {
            const speed = 2;
            let { x, y } = player.position;
            
            if (keysPressed['w'] || keysPressed['arrowup']) y -= speed;
            if (keysPressed['s'] || keysPressed['arrowdown']) y += speed;
            if (keysPressed['a'] || keysPressed['arrowleft']) x -= speed;
            if (keysPressed['d'] || keysPressed['arrowright']) x += speed;
            
            x = Math.max(0, Math.min(x, bounds.width - 40));
            y = Math.max(0, Math.min(y, bounds.height - 40));

            if (x !== player.position.x || y !== player.position.y) {
                onUpdateObject({ ...player, position: { ...player.position, x, y } });
            }
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        };
        gameLoopRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [keysPressed, player, onUpdateObject, bounds]);
};


const SceneEntity: React.FC<{
  object: SceneObject;
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ object, isSelected, onSelect }) => {
    const getIcon = () => {
        switch (object.type) {
            case 'Player': return <PlayerIcon className="w-full h-full" style={{ color: object.color }} />;
            case 'Part': return <CubeIcon className="w-full h-full opacity-90" />;
            case 'ViewPort': return <ViewPortIcon className="w-full h-full opacity-90" />;
            case 'DirectionalLight': return <LightIcon className="w-full h-full opacity-90" />;
            case 'PointLight': return <PointLightIcon className="w-full h-full opacity-90" />;
            case 'Wedge': return <WedgeIcon className="w-full h-full opacity-90" />;
            case 'Cone': return <ConeIcon className="w-full h-full opacity-90" />;
            default: return null;
        }
    };
    
    const entityStyle: React.CSSProperties = {
        width: `${40 * object.scale.x}px`,
        height: `${40 * object.scale.y}px`,
        transform: `rotateX(${object.rotation.x}deg) rotateY(${object.rotation.y}deg) rotateZ(${object.rotation.z}deg)`,
        backgroundColor: object.color,
        backgroundImage: object.texture ? `url(${object.texture})` : 'none',
        backgroundSize: 'cover',
    };
    
    if (object.type === 'Player') {
        entityStyle.width = `${40 * object.scale.x}px`;
        entityStyle.height = `${60 * object.scale.y}px`;
        entityStyle.transform = `translateX(-50%) translateY(-100%)`;
        entityStyle.transformOrigin = 'bottom center';
    }


    return (
        <div 
          className="absolute"
          style={{ 
            left: `${object.position.x}px`, 
            top: `${object.position.y}px`, 
            zIndex: Math.round(object.position.y),
            transformStyle: 'preserve-3d',
          }}
          onMouseDown={(e) => { e.stopPropagation(); onSelect(object.id); }}>
            <div
                style={entityStyle}
                className={`relative transition-transform duration-100 ease-out cursor-grab active:cursor-grabbing
                    ${isSelected ? 'z-10' : ''}
                `}
            >
              <div className={`w-full h-full ${isSelected ? 'outline outline-2 outline-offset-2 outline-cyan-400' : ''}`}>
                {getIcon()}
              </div>
              {object.type === 'Player' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/40 rounded-[50%] blur-sm"></div>}
              {isSelected && object.type === 'Player' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-cyan-400 rounded-[50%] blur-md"></div>
              )}
            </div>
        </div>
    );
};

const SceneView: React.FC<SceneViewProps> = ({ files, sceneObjects, selectedObjectId, onSelectObject, onUpdateObject, isPlayMode }) => {
    const groundRef = useRef<HTMLDivElement>(null);
    const player = sceneObjects.find(obj => obj.type === 'Player');
    const camera = sceneObjects.find(obj => obj.type === 'ViewPort');
    const worldBounds = { width: 800, height: 600 };
    
    usePlayerMovement(player, onUpdateObject, worldBounds);

    const [cameraRotation, setCameraRotation] = useState({ x: 60, y: 0 });
    const [cameraPan, setCameraPan] = useState({ x: 0, y: 0 });
    const [cameraZoom, setCameraZoom] = useState(1);
    const isRotating = useRef(false);
    const isPanning = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    const lightsInScene = useMemo(() => {
        const lightingFolder = files.find(f => f.id === 'lighting');
        if (!lightingFolder || !lightingFolder.children) return [];
        const lightIds = lightingFolder.children.map(f => f.id);
        return sceneObjects.filter(obj => lightIds.includes(obj.id)) as LightObject[];
    }, [files, sceneObjects]);


    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 2) isRotating.current = true;
        else if (e.button === 1) isPanning.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseUp = useCallback(() => {
        isRotating.current = false;
        isPanning.current = false;
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isRotating.current && !isPanning.current) return;
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;

        if (isRotating.current) {
            setCameraRotation(prev => ({
                x: Math.max(10, Math.min(90, prev.x - dy * 0.5)),
                y: prev.y + dx * 0.5
            }));
        }
        if(isPanning.current) {
            setCameraPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        }
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        setCameraZoom(prev => Math.max(0.2, Math.min(5, prev - e.deltaY * 0.005)));
    }, []);

    useEffect(() => {
        const currentRef = groundRef.current;
        if (!currentRef) return;
        const preventContext = (e: Event) => e.preventDefault();
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        currentRef.addEventListener('contextmenu', preventContext);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            currentRef.removeEventListener('contextmenu', preventContext);
        };
    }, [handleMouseMove, handleMouseUp]);


    const cameraStyle: React.CSSProperties = {};
    if (camera && camera.type === 'ViewPort' && player && player.type === 'Player' && isPlayMode) {
        if (camera.mode === CameraMode.THIRD_PERSON) {
            cameraStyle.transform = `translateX(${cameraPan.x}px) translateY(${cameraPan.y}px) rotateX(${cameraRotation.x}deg) rotateY(${cameraRotation.y}deg) scale(${camera.zoom * cameraZoom})`;
        } else { // FIRST_PERSON
            const xOffset = worldBounds.width / 2 - player.position.x;
            const yOffset = worldBounds.height / 2 - player.position.y;
            cameraStyle.transform = `translate(${xOffset}px, ${yOffset}px) rotateX(20deg) scale(${camera.zoom})`;
            cameraStyle.transition = 'transform 0.3s ease-out';
        }
    } else {
        cameraStyle.transform = `translateX(${cameraPan.x}px) translateY(${cameraPan.y}px) rotateX(${cameraRotation.x}deg) rotateY(${cameraRotation.y}deg) scale(${cameraZoom})`;
    }
    
    return (
        <div className="w-full h-full bg-[#16171C] flex flex-col" style={{ perspective: '1200px' }} onMouseDown={handleMouseDown} onWheel={handleWheel}>
            <div className="flex-shrink-0 bg-black/20 p-2 text-gray-400 border-b border-white/10 flex items-center space-x-2">
                <ViewIcon className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-sm">ViewPort</span>
            </div>
            <div className="w-full flex-1 relative overflow-hidden flex items-center justify-center p-4">
                <div 
                  className="relative transition-transform duration-500"
                  style={{ transformStyle: 'preserve-3d', ...cameraStyle, transition: isPanning.current || isRotating.current ? 'none' : 'transform 0.5s' }}
                >
                    <div 
                        ref={groundRef}
                        onClick={() => onSelectObject(null)}
                        style={{ 
                            width: `${worldBounds.width}px`,
                            height: `${worldBounds.height}px`,
                            backgroundSize: '40px 40px',
                            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                            boxShadow: '0 0 80px rgba(0,0,0,0.7)',
                            backgroundColor: '#20222a'
                        }}
                        className="relative"
                    >
                        {/* Only render non-light objects here. Lights are for effect only. */}
                        {sceneObjects.filter(o => o.type !== 'DirectionalLight' && o.type !== 'PointLight').map(obj => (
                            <SceneEntity
                                key={obj.id}
                                object={obj}
                                isSelected={obj.id === selectedObjectId}
                                onSelect={onSelectObject}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SceneView;