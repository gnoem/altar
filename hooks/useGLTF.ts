/* eslint-disable global-require */
import { useEffect, useState } from "react";
import * as THREE from "three";

const useGLTF = (filePath: string, texture?: any): any => {
  const [scene, setScene] = useState(null);
  
  useEffect(() => {
    if (scene || (texture === 'loading')) return;
    const renderObject = () => {
      const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      loader.load(filePath, (gltf: any) => {
        console.log(`loaded model at ${filePath}`);
        gltf.scene.traverse((child: any) => {
          if (texture && child.material) {
            child.material = texture;
          }
        });
        setScene(gltf.scene);
      });
    }
    renderObject();
  }, [scene, texture]);

  return scene;
}

export default useGLTF;