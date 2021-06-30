import * as THREE from "three";

const clock = new THREE.Clock();

class Loop {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  updatables: any[];

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.updatables = [];
  }

  start() {
    this.renderer.setAnimationLoop(() => {
      this.tick();
      this.renderer.render(this.scene, this.camera);
    });
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  add(obj: any) {
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