/* eslint-disable global-require */
import { useEffect, useState } from "react";
import * as THREE from "three";

const useGLTF = (filePath: string, materialPath?: string): any => {
  const [scene, setScene] = useState(null);
  const [material, setMaterial] = useState<THREE.MeshBasicMaterial | null>(null);
  
  useEffect(() => {
    if (scene) return;
    if (materialPath && !material) return;
    const renderObject = () => {
      const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      loader.load(filePath, (gltf: any) => {
        console.log(`loaded model at ${filePath}`);
        gltf.scene.traverse((child: any) => {
          if (materialPath && child.material) {
            child.material = material;
          }
        });
        setScene(gltf.scene);
      });
    }
    renderObject();
  }, [scene, material]);

  useEffect(() => {
    if (!materialPath) return;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(materialPath, (texture: any) => {
      texture.encoding = THREE.sRGBEncoding;
      texture.flipY = false;
      const loadedMaterial = new THREE.MeshBasicMaterial({ map: texture });
      setMaterial(loadedMaterial);
    });
  }, []);

  return scene;
}

export default useGLTF;