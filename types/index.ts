import { Loop } from "@lib";
import * as THREE from "three";

export interface IThreeScene {
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  renderer: THREE.WebGLRenderer | null;
  loop?: Loop | null;
}

export interface ILoadedObject {
  key: string;
  sceneComponents: IThreeScene;
  setLoaded: (value: boolean) => void;
}

export interface IKeyframe {
  [key: string]: number[]
}

export interface IAnimation {
  animationMap: { [start: string]: string | null };
  startFrom: string;
  animationKeyframes: () => IKeyframeMap;
  playAnimation: (mixer: THREE.AnimationMixer) => { [key: string]: () => void }
}

export interface IAnimationData {
  animationKeyframes: () => IKeyframeMap;
  playAnimation: (mixer: THREE.AnimationMixer, states: string[], times: number[]) => void
}

export interface IInteractionDef {
  steps: string[];
  times: number[];
}

export interface IAnimationMap {
  [start: string]: IInteractionDef
}

export type IDialogue = (
  scene: THREE.Scene,
  next: () => void,
  castState: (state: IInteractionDef) => void
) => {
  [state: string]: () => void
}

export interface IRawKeyframe {
  position: number[];
  rotation: number[];
  scale: number[];
}

export interface IKeyframeMap {
  [name: string]: IRawKeyframe
}

export interface IInteraction {
  blueprint: IAnimationMap;
  startFrom: string;
  animations: IAnimationData;
  dialogue: IDialogue | null
}