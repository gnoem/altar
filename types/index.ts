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