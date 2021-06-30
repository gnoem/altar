import * as THREE from "three";

const clock = new THREE.Clock();

class Loop {
  constructor(scene, camera, renderer) {
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
  add(obj) {
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