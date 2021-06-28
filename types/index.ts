import * as THREE from "three";

export interface IThreeScene {
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  renderer: THREE.WebGLRenderer | null;
}

export interface ILoadedObject {
  sceneComponents: IThreeScene;
  setLoaded: (value: boolean) => void;
}