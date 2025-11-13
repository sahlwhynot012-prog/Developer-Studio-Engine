
import React from 'react';
import { SceneObject, CameraMode, ProjectFile, StringValue, NumberValue } from '../types';
import { InspectIcon, FirstPersonIcon, ThirdPersonIcon } from './icons/CoreIcons';

interface PropertiesPanelProps {
  selectedObject: SceneObject | null;
  selectedFile: ProjectFile | null;
  onUpdateObject: (object: SceneObject) => void;
  onUpdateFileValue: (fileId: string, value: string | number) => void;
}

const PropertySlider: React.FC<{ label: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, min: number, max: number, step: number }> = ({ label, value, ...props }) => (
     <div className="grid grid-cols-5 items-center gap-2">
        <label className="text-xs text-gray-400 col-span-2">{label}</label>
        <div className="col-span-3 flex items-center gap-2">
            <input type="range" value={value} {...props} />
        </div>
    </div>
);


const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedObject, selectedFile, onUpdateObject, onUpdateFileValue }) => {
    if (!selectedFile) {
        return (
            <div className="p-4 text-sm text-gray-500 flex flex-col items-center justify-center h-full">
                <InspectIcon className="w-10 h-10 text-gray-600 mb-2"/>
                <span>No instance selected</span>
            </div>
        );
    }

    const handleChange = (field: keyof SceneObject, value: any) => {
        if (selectedObject) {
            onUpdateObject({ ...selectedObject, [field]: value });
        }
    };

    const handleVectorChange = (field: 'position' | 'rotation' | 'scale', axis: 'x' | 'y' | 'z', value: string) => {
        if(selectedObject) {
            const numValue = parseFloat(value) || 0;
            onUpdateObject({ ...selectedObject, [field]: { ...selectedObject[field], [axis]: numValue }});
        }
    };

    const handleTextureRemove = () => {
        if(selectedObject) {
            const { texture, ...rest } = selectedObject;
            onUpdateObject(rest);
        }
    };
    
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const file = selectedFile as NumberValue | StringValue;
        const newValue = file.type === 'NumberValue' ? parseFloat(e.target.value) || 0 : e.target.value;
        onUpdateFileValue(file.id, newValue);
    }
    
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 space-y-4 overflow-y-auto">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">{selectedFile.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">ID: {selectedFile.id}</p>
                </div>
                
                {selectedObject && (
                    <>
                        <div className="bg-black/20 p-3 rounded-lg space-y-3">
                            <h4 className="text-sm font-semibold text-gray-300">Transform</h4>
                            {['position', 'rotation', 'scale'].map(field => (
                                <div key={field} className="grid grid-cols-5 items-center gap-2">
                                    <label className="text-xs text-gray-400 col-span-2 capitalize">{field}</label>
                                    <div className="grid grid-cols-3 gap-1 col-span-3">
                                        {['x', 'y', 'z'].map(axis => (
                                            <input key={axis} value={(selectedObject as any)[field][axis]} onChange={(e) => handleVectorChange(field as 'position', axis as 'x', e.target.value)} type="number" step={field === 'rotation' ? 1 : 0.1} className="bg-[#0D0E12] text-sm rounded-md p-1.5 w-full focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder={axis.toUpperCase()} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                         <div className="bg-black/20 p-3 rounded-lg space-y-3">
                            <h4 className="text-sm font-semibold text-gray-300">Appearance</h4>
                            <div className="grid grid-cols-5 items-center gap-2">
                                <label className="text-xs text-gray-400 col-span-2">Color</label>
                                <div className="relative col-span-3">
                                    <input type="color" value={selectedObject.color} onChange={(e) => handleChange('color', e.target.value)} className="bg-transparent w-full h-8 p-0 border-none cursor-pointer" />
                                    <div className="absolute inset-0 rounded-md pointer-events-none border border-white/10" style={{ backgroundColor: selectedObject.color }}></div>
                                </div>
                            </div>
                            {selectedObject.texture && (
                                <div className="space-y-2">
                                     <label className="text-xs text-gray-400">Texture</label>
                                     <div className="relative">
                                        <img src={selectedObject.texture} alt="Generated texture" className="w-full h-auto rounded-md border border-white/10" />
                                        <button onClick={handleTextureRemove} className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold hover:bg-red-700">&times;</button>
                                     </div>
                                </div>
                            )}
                        </div>

                        { (selectedObject.type === 'DirectionalLight' || selectedObject.type === 'PointLight') && (
                             <div className="bg-black/20 p-3 rounded-lg space-y-3">
                                <h4 className="text-sm font-semibold text-gray-300">Light</h4>
                                <PropertySlider label="Intensity" min={0} max={5} step={0.1} value={selectedObject.intensity} onChange={(e) => onUpdateObject({ ...selectedObject, intensity: parseFloat(e.target.value) })} />
                            </div>
                        )}
                        
                        { selectedObject.type === 'ViewPort' && (
                             <div className="bg-black/20 p-3 rounded-lg space-y-3">
                                <h4 className="text-sm font-semibold text-gray-300">ViewPort</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => onUpdateObject({ ...selectedObject, mode: CameraMode.THIRD_PERSON })} className={`flex flex-col items-center p-2 rounded-md ${selectedObject.mode === CameraMode.THIRD_PERSON ? 'bg-cyan-500/30' : 'bg-white/5'}`}>
                                        <ThirdPersonIcon className="w-6 h-6 mb-1"/>
                                        <span className="text-xs">3rd Person</span>
                                    </button>
                                     <button onClick={() => onUpdateObject({ ...selectedObject, mode: CameraMode.FIRST_PERSON })} className={`flex flex-col items-center p-2 rounded-md ${selectedObject.mode === CameraMode.FIRST_PERSON ? 'bg-cyan-500/30' : 'bg-white/5'}`}>
                                        <FirstPersonIcon className="w-6 h-6 mb-1"/>
                                        <span className="text-xs">1st Person</span>
                                    </button>
                                </div>
                                <PropertySlider label="Zoom" min={0.5} max={3} step={0.1} value={selectedObject.zoom} onChange={(e) => onUpdateObject({ ...selectedObject, zoom: parseFloat(e.target.value) })} />
                            </div>
                        )}
                    </>
                )}
                { (selectedFile.type === 'NumberValue' || selectedFile.type === 'StringValue') && (
                    <div className="bg-black/20 p-3 rounded-lg space-y-3">
                        <h4 className="text-sm font-semibold text-gray-300">Value</h4>
                        <div className="grid grid-cols-5 items-center gap-2">
                             <label className="text-xs text-gray-400 col-span-2">Data</label>
                             <div className="col-span-3">
                                <input 
                                    type={selectedFile.type === 'NumberValue' ? 'number' : 'text'}
                                    value={(selectedFile as StringValue | NumberValue).value}
                                    onChange={handleValueChange}
                                    className="bg-[#0D0E12] text-sm rounded-md p-1.5 w-full focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertiesPanel;