/* eslint-disable global-require */
import { useEffect, useState } from "react";

const useGLTF = (filePath: string): any => {
  const [scene, setScene] = useState(null);
  useEffect(() => {
    if (scene) return;
    const renderObject = () => {
      const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      loader.load(filePath, (gltf: any) => {
        setScene(gltf.scene);
      });
    }
    renderObject();
  }, [scene]);
  return scene;
}

export default useGLTF;