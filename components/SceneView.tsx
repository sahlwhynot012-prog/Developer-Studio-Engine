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

interface LightingInfo {
    shadowAngle: number;
    shadowOpacity: number;
    highlightOpacity: number;
    lightColor: string;
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
  lighting: LightingInfo;
}> = ({ object, isSelected, onSelect, lighting }) => {
    const getIcon = () => {
        const iconProps = {
             className: "w-full h-full object-shadow",
             lighting: lighting,
        };
        switch (object.type) {
            case 'Player': return <PlayerIcon {...iconProps} style={{ color: object.color }} />;
            case 'Part': return <CubeIcon {...iconProps} style={{ color: object.color }} />;
            case 'ViewPort': return <ViewPortIcon className="w-full h-full opacity-90" />;
            case 'DirectionalLight': return <LightIcon className="w-full h-full opacity-90" />;
            case 'PointLight': return <PointLightIcon className="w-full h-full opacity-90" />;
            case 'Wedge': return <WedgeIcon {...iconProps} style={{ color: object.color }}/>;
            case 'Cone': return <ConeIcon {...iconProps} style={{ color: object.color }}/>;
            default: return null;
        }
    };
    
    const entityStyle: React.CSSProperties = {
        width: `${40 * object.scale.x}px`,
        height: `${40 * object.scale.y}px`,
        transform: `rotateX(${object.rotation.x}deg) rotateY(${object.rotation.y}deg) rotateZ(${object.rotation.z}deg)`,
        backgroundImage: object.texture ? `url(${object.texture})` : 'none',
        backgroundSize: 'cover',
    };
    
    if (object.type === 'Player') {
        entityStyle.width = `40px`;
        entityStyle.height = `60px`;
        entityStyle.transform = `translateX(-50%) translateY(-100%) scaleX(${object.scale.x}) scaleY(${object.scale.y})`;
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
              <div className={`w-full h-full ${isSelected ? 'outline outline-2 outline-offset-2 outline-cyan-400 rounded-md' : ''}`}>
                {getIcon()}
              </div>
              {object.type === 'Player' && (
                  <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-black rounded-[50%] blur-sm"
                    style={{ opacity: lighting.shadowOpacity * 0.8 }}
                  ></div>
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
    
    const lightingInfo = useMemo<LightingInfo>(() => {
        const dirLight = lightsInScene.find(l => l.type === 'DirectionalLight');
        if (!dirLight) return { shadowAngle: 135, shadowOpacity: 0.3, highlightOpacity: 0.1, lightColor: '#ffffff' };
        
        const angle = (Math.atan2(dirLight.position.y - worldBounds.height/2, dirLight.position.x - worldBounds.width/2) * 180 / Math.PI) - 90;
        return {
            shadowAngle: angle,
            shadowOpacity: Math.min(0.7, dirLight.intensity * 0.3),
            highlightOpacity: Math.min(0.5, dirLight.intensity * 0.15),
            lightColor: dirLight.color,
        };
    }, [lightsInScene, worldBounds]);


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
            <div className="w-full flex-1 relative overflow-hidden flex items-center justify-center p-4 sky-gradient">
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
                            transform: 'rotateX(90deg) translateZ(-100px)',
                            boxShadow: '0 0 80px rgba(0,0,0,0.7)',
                        }}
                        className="relative ground-plane"
                    >
                        {lightsInScene.filter(l => l.type === 'PointLight').map(light => (
                             <div key={light.id} className="absolute rounded-full" style={{
                                left: light.position.x,
                                top: light.position.y,
                                width: 100 * light.intensity,
                                height: 100 * light.intensity,
                                background: `radial-gradient(circle, ${light.color}11, transparent 60%)`,
                                transform: 'translate(-50%, -50%)'
                             }}></div>
                        ))}
                    </div>
                     <div className="absolute top-0 left-0" style={{ transformStyle: 'preserve-3d', width: `${worldBounds.width}px`, height: `${worldBounds.height}px` }}>
                        {sceneObjects.filter(o => o.type !== 'DirectionalLight' && o.type !== 'PointLight' && o.type !== 'ViewPort').map(obj => (
                            <SceneEntity
                                key={obj.id}
                                object={obj}
                                isSelected={obj.id === selectedObjectId}
                                onSelect={onSelectObject}
                                lighting={lightingInfo}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SceneView;