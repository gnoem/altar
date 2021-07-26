/* eslint-disable global-require */
import { useEffect, useState } from "react";
import { IMeshRegistrationObject } from "@types";

const useGLTF = (filePath: string, meshRegistration?: IMeshRegistrationObject): any => {
  const [object, setObject] = useState(null);
  
  useEffect(() => {
    if (object) return; // don't want this to run again if glTF has already been loaded
    const loadObject = () => {
      const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      loader.load(filePath, (gltf: any) => {
        console.log(`loaded model at ${filePath}`);
        if (meshRegistration) {
          gltf.scene.traverse((child: any) => {
            if ((child.type === 'Mesh') && meshRegistration[child.name]) {
              meshRegistration[child.name](child);
            }
          });
        }
        setObject(gltf.scene);
      });
    }
    loadObject();
  }, [object]);

  return object;
}

export default useGLTF;