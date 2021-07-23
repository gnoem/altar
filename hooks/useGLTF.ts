/* eslint-disable global-require */
import { useEffect, useState } from "react";
import * as THREE from "three";
import { IMeshConfig } from "@types";

type IMeshConfigFunction = (object?: THREE.Mesh) => IMeshConfig;

interface IMeshConfigObject {
  [meshName: string]: IMeshConfigFunction
}

const useGLTF = (filePath: string, config?: IMeshConfigObject): any => {
  const [object, setObject] = useState(null);
  
  useEffect(() => {
    const materialsStillLoading = config && Object.values(config).some((mesh: IMeshConfigFunction) => mesh().material === 'loading');
    if (object || materialsStillLoading) return;
    const renderObject = () => {
      const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      loader.load(filePath, (gltf: any) => {
        console.log(`loaded model at ${filePath}`);
        if (config) {
          gltf.scene.traverse((child: any) => {
            if ((child.type === 'Mesh') && config[child.name]) {
              Object.assign(child, config[child.name](child));
            }
          });
        }
        setObject(gltf.scene);
      });
    }
    renderObject();
  }, [object, config]);

  return object;
}

export default useGLTF;