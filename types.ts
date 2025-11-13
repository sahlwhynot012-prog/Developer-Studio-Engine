// --- INSTANCE TYPES ---
export type SceneObjectType = 
  | 'Player' 
  | 'ViewPort' 
  | 'DirectionalLight'
  | 'PointLight'
  | 'Part' 
  | 'Wedge'
  | 'Cone';

export type ScriptType = 'Script' | 'LocalScript' | 'ModuleScript';

export type GuiType = 'ScreenGui' | 'Frame' | 'TextButton';

export type ValueType = 'NumberValue' | 'StringValue';

export type InstanceType = 
  | 'Folder'
  | 'Model'
  | 'Tool'
  | 'RemoteEvent'
  | 'asset'
  | SceneObjectType
  | ScriptType
  | GuiType
  | ValueType;


// --- SCENE OBJECTS (Physical/Visual) ---
export enum CameraMode {
  THIRD_PERSON = 'third_person',
  FIRST_PERSON = 'first_person',
}
export interface BaseSceneObject {
  id: string;
  name: string;
  type: SceneObjectType;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
  texture?: string; // base64 data url
}

export interface PlayerObject extends BaseSceneObject {
  type: 'Player';
}

export interface ViewPortObject extends BaseSceneObject {
  type: 'ViewPort';
  mode: CameraMode;
  zoom: number;
}

export interface LightObject extends BaseSceneObject {
  type: 'DirectionalLight' | 'PointLight';
  intensity: number;
}

export interface PartObject extends BaseSceneObject {
  type: 'Part' | 'Wedge' | 'Cone';
}

export type SceneObject = PlayerObject | ViewPortObject | LightObject | PartObject;


// --- GUI OBJECTS ---
export interface BaseGuiObject {
    id: string;
    name: string;
    type: GuiType;
    position: { x: number, y: number }; // Scale (0-1)
    size: { x: number, y: number }; // Pixels
    anchorPoint: { x: number, y: number };
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    visible: boolean;
}
export interface ScreenGuiObject extends BaseGuiObject {
    type: 'ScreenGui';
    children: GuiObject[];
}
export interface FrameObject extends BaseGuiObject {
    type: 'Frame';
    children: GuiObject[];
}
export interface TextButtonObject extends BaseGuiObject {
    type: 'TextButton';
    text: string;
    textColor: string;
    fontSize: number;
    children: GuiObject[];
}

export type GuiObject = ScreenGuiObject | FrameObject | TextButtonObject;


// --- FILE HIERARCHY ---
export interface BaseProjectFile {
  id: string;
  name: string;
  type: InstanceType;
  children?: ProjectFile[];
  content?: string; // For scripts
  undeletable?: boolean;
  unrenameable?: boolean;
  position?: { x: number, y: number };
  size?: { x: number, y: number };
  backgroundColor?: string;
  text?: string;
}

export interface StringValue extends BaseProjectFile {
    type: 'StringValue';
    value: string;
}

export interface NumberValue extends BaseProjectFile {
    type: 'NumberValue';
    value: number;
}

export type ProjectFile = BaseProjectFile | StringValue | NumberValue;


// --- PROJECT & APP STATE ---
export type ProjectState = 'main-menu' | 'loading' | 'editor';

export type SaveStatus = 'unsaved' | 'saving' | 'saved' | 'auto-saving';

export interface ConsoleLog {
    type: 'log' | 'warn' | 'error';
    message: string;
    timestamp?: string;
}

export interface ProjectTemplate {
    files: ProjectFile[];
    sceneObjects: SceneObject[];
    logs: ConsoleLog[];
    activeScriptId: string | null;
    selectedObjectId: string | null;
}