import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from "@hooks";
import { ILoadedObject, ILoadTextureInput } from "@types";
import { transformObject, loadObject, defineMaterial } from "@utils";

const getTextureData = (): ILoadTextureInput => {
  const textures = {
    'bumpMap': 'textures/bone2.png'
  }
  
  const createMaterial = defineMaterial(THREE.MeshPhongMaterial, {
    bumpScale: 0.1,
    color: 0x5D5046,
    specular: 0xBEB4AE,
    shininess: 5
  });

  return {
    textures,
    createMaterial
  }
}

const Bowl: React.FC<ILoadedObject> = ({ name, sceneComponents }) => {
  const [model, setModel] = useState<any>(null);

  const material = new THREE.MeshPhysicalMaterial({
    metalness: 0,
    roughness: 0.1,
    transparent: true,
    transmission: 1,
    //opacity: 0.5,
    reflectivity: 0.2,
    //refractionRatio: 0.985,
    ior: 2,
    color: 0x777777,
    //side: THREE.DoubleSide,
  });
  const object = useGLTF('gltf/bowl.glb');

  useEffect(() => {
    if (!object || model) return;
    object.doubleSided = true;
    object.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        //obj.receiveShadow = true;
      }
    });
    object.name = name;
    transformObject.position(object, [0, -3, 5]);
    transformObject.rotation(object, [0, 0, 0]);
    loadObject(object, sceneComponents);
    setModel(object);
  }, [object, model]);

  return null;
}

export default Bowl;
