import { PointerLockControls } from "@lib/three";
import { SceneObject } from "@types";
import * as THREE from "three";

type Updatable = SceneObject | PointerLockControls;

const clock = new THREE.Clock();

class Loop {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  updatables: Updatable[];

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.updatables = [];
  }

  start() {
    this.renderer.setAnimationLoop((): void => {
      this.tick();
      this.renderer.render(this.scene, this.camera);
    });
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  add(obj: Updatable) {
    this.updatables.push(obj);
  }
  
  tick() {
    const delta = clock.getDelta();
    for (const object of this.updatables) {
      object.userData.tick?.(delta);
    }
  }
}

export default Loop;