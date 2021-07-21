/* eslint-disable global-require */
import { ThreeMaterial } from "@types";
import { useEffect, useState } from "react";

interface IMaterial {
  [meshName: string]: ThreeMaterial | 'loading'
}

const useGLTF = (filePath: string, materials?: IMaterial): any => {
  const [object, setObject] = useState(null);
  
  useEffect(() => {
    const materialsStillLoading = materials && Object.values(materials).some(material => material === 'loading');
    if (object || materialsStillLoading) return;
    const renderObject = () => {
      const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      loader.load(filePath, (gltf: any) => {
        console.log(`loaded model at ${filePath}`);
        if (materials) {
          gltf.scene.traverse((child: any) => {
            if (child.material && materials[child.name]) {
              child.material = materials[child.name];
            }
          });
        }
        setObject(gltf.scene);
      });
    }
    renderObject();
  }, [object, materials]);

  return object;
}

export default useGLTF;