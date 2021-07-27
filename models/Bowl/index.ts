import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useAddObject, useGLTF } from "@hooks";
import { IObjectComponentProps, ILoadTextureInput, SceneObject } from "@types";
import { transformObject, defineMaterial } from "@utils";

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

const Bowl: React.FC<IObjectComponentProps> = ({ name, sceneComponents }): null => {

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

  useAddObject(object, sceneComponents, (object: SceneObject): void => {
    const obj = (object as THREE.Mesh);
    obj.name = name;
    obj.material = material;
    transformObject.position(obj, [0, -3, 5]);
    transformObject.rotation(obj, [0, 0, 0]);
  });

  return null;
}

export default Bowl;
