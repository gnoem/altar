import { useEffect, useState } from "react";
import * as THREE from "three";

export const useScene = (sceneRef: HTMLElement | null): {
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  renderer: THREE.WebGLRenderer | null;
} => {
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.Camera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  useEffect(() => {
    if (!sceneRef || scene) return;
    const myScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    addLighting(myScene);
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    camera.position.z = 10;
    setScene(myScene);
    setCamera(camera);
    setRenderer(renderer);
    // @ts-ifgnore: Object is possibly 'null'
    sceneRef.appendChild(renderer.domElement);
  }, [scene, sceneRef]);
  return {
    scene,
    camera,
    renderer
  }
}

const addLighting = (scene: THREE.Scene): void => {
  const ambientLight = new THREE.AmbientLight( 0x777777 );
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  directionalLight.position.x = 2;
  directionalLight.position.z = 2;
  directionalLight.shadow.bias = 0.001;
  directionalLight.shadow.normalBias = 0.003;
  scene.add( directionalLight ); // needed for shadows!!
  scene.add( ambientLight );
}