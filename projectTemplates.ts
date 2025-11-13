import { ProjectTemplate, CameraMode, ProjectFile } from './types';

const PROTECTED_FOLDER = { undeletable: true, unrenameable: true, type: 'Folder' as 'Folder' };

const createSystemFolders = (children: ProjectFile[] = []): ProjectFile[] => [
    { id: 'workspace', name: 'Workspace', children, ...PROTECTED_FOLDER },
    { id: 'lighting', name: 'Lighting', children: [], ...PROTECTED_FOLDER },
    { id: 'replicated-storage', name: 'ReplicatedStorage', children: [], ...PROTECTED_FOLDER },
    { id: 'server-script-service', name: 'ServerScriptService', children: [], ...PROTECTED_FOLDER },
    { 
        id: 'starter-player', name: 'StarterPlayer', ...PROTECTED_FOLDER, children: [
            { id: 'starter-player-scripts', name: 'StarterPlayerScripts', type: 'Folder', children: [], ...PROTECTED_FOLDER },
            { id: 'starter-character-scripts', name: 'StarterCharacterScripts', type: 'Folder', children: [], ...PROTECTED_FOLDER },
        ] 
    },
    { id: 'starter-gui', name: 'StarterGui', children: [], ...PROTECTED_FOLDER },
    { id: 'starter-pack', name: 'StarterPack', children: [], ...PROTECTED_FOLDER },
    { id: 'assets-folder', name: 'Assets', children: [], ...PROTECTED_FOLDER },
    { id: 'audio-folder', name: 'Audio', children: [], ...PROTECTED_FOLDER },
];

const blankTemplate: ProjectTemplate = {
    files: createSystemFolders(),
    sceneObjects: [],
    logs: [{ type: 'log', message: 'New blank project created. Engine is now Lua-first.' }],
    activeScriptId: null,
    selectedObjectId: null,
};

const basicSceneTemplate: ProjectTemplate = {
    files: [
        { 
            id: 'workspace', name: 'Workspace', ...PROTECTED_FOLDER, children: [
                { id: 'player-1', name: 'Player', type: 'Player' },
                { id: 'cube-1', name: 'CoolCube', type: 'Part' },
            ]
        },
        {
            id: 'lighting', name: 'Lighting', ...PROTECTED_FOLDER, children: [
                { id: 'main-camera', name: 'ViewPort', type: 'ViewPort' },
                { id: 'main-light', name: 'DirectionalLight', type: 'DirectionalLight' },
            ]
        },
        { id: 'replicated-storage', name: 'ReplicatedStorage', ...PROTECTED_FOLDER, children: [] },
        { 
            id: 'server-script-service', name: 'ServerScriptService', ...PROTECTED_FOLDER, children: [
                 { id: 'game-manager', name: 'GameManager', type: 'Script', content: `-- GameManager.lua\n\nprint("Game Started!")\n` },
            ] 
        },
        { 
            id: 'starter-player', name: 'StarterPlayer', ...PROTECTED_FOLDER, children: [
                { id: 'starter-player-scripts', name: 'StarterPlayerScripts', type: 'Folder', children: [
                     { id: 'player-controller', name: 'PlayerController', type: 'LocalScript', content: `-- PlayerController.lua\n-- Player movement is handled by the engine.\n-- This script can be used for custom client-side logic.\n\nprint("PlayerController LocalScript loaded.")\n` },
                ], ...PROTECTED_FOLDER },
                { id: 'starter-character-scripts', name: 'StarterCharacterScripts', type: 'Folder', children: [], ...PROTECTED_FOLDER },
            ] 
        },
        { id: 'starter-gui', name: 'StarterGui', ...PROTECTED_FOLDER, children: [
            { 
                id: 'sg-1', name: 'MainUI', type: 'ScreenGui', children: [
                    { id: 'frame-1', name: 'WelcomeFrame', type: 'Frame', position: {x: 0.5, y: 0.1}, size: {x: 200, y: 50}, backgroundColor: '#2A2A38', children: [
                        { id: 'text-1', name: 'TitleLabel', type: 'TextButton', position: {x: 0.5, y: 0.5}, size: {x: 180, y: 30}, backgroundColor: '#4A4A58', text: 'Welcome to DSE!' }
                    ]}
                ]
            }
        ] },
        { id: 'starter-pack', name: 'StarterPack', children: [], ...PROTECTED_FOLDER },
        { id: 'assets-folder', name: 'Assets', children: [], ...PROTECTED_FOLDER },
        { id: 'audio-folder', name: 'Audio', children: [], ...PROTECTED_FOLDER },
    ],
    sceneObjects: [
        { id: 'player-1', name: 'Player', type: 'Player', position: { x: 380, y: 280, z: 0 }, rotation: {x:0, y:0, z:0}, scale: {x:1, y:1, z:1}, color: '#34d399' },
        { id: 'cube-1', name: 'CoolCube', type: 'Part', position: { x: 150, y: 150, z: 0 }, rotation: {x:20, y:45, z:0}, scale: {x:1, y:1, z:1}, color: '#8b5cf6' },
        { id: 'main-camera', name: 'ViewPort', type: 'ViewPort', position: { x: 0, y: 0, z: 0 }, rotation: {x:0, y:0, z:0}, scale: {x:1, y:1, z:1}, color: '#9ca3af', mode: CameraMode.THIRD_PERSON, zoom: 1 },
        { id: 'main-light', name: 'DirectionalLight', type: 'DirectionalLight', position: { x: 50, y: 50, z: 100 }, rotation: {x:0, y:0, z:0}, scale: {x:1, y:1, z:1}, color: '#facc15', intensity: 1.5 },
    ],
    logs: [
        { type: 'log', message: 'DSE Engine v1.04 initialized (Lua-first).' },
        { type: 'log', message: 'Use W, A, S, D or Arrow Keys to move the player.' },
    ],
    activeScriptId: 'player-controller',
    selectedObjectId: 'player-1',
};


export const getTemplate = (id: string): ProjectTemplate => {
    switch (id) {
        case 'blank':
            return JSON.parse(JSON.stringify(blankTemplate));
        case 'basic':
            return JSON.parse(JSON.stringify(basicSceneTemplate));
        default:
            return JSON.parse(JSON.stringify(blankTemplate));
    }
};