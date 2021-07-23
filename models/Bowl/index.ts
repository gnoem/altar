import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from "@hooks";
import { ILoadedObject, ILoadTextureInput } from "@types";
import { castModel, loadObject, defineMaterial } from "@utils";

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

const Bowl: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
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

  /* const interactionName = 'tusks';
  const interaction = interactions[interactionName];
  const { startFrom, animations } = interaction;
  const { interact } = useInteraction(model, sceneComponents, interaction); */

  useEffect(() => {
    if (!object || model) return;
    object.doubleSided = true;
    object.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        //obj.receiveShadow = true;
      }
    });
    //const initial = animations.animationKeyframes()[startFrom];
    castModel.position(object, [0, -3, 5]);
    castModel.rotation(object, [0, 0, 0]);
    object.name = 'tusks';
    object.userData.hoverCursor = 'pointer'; // remove after first interaction?
    object.userData.events = {
      //click: interact
    }
    loadObject(object, sceneComponents, setLoaded);
    setModel(object);
  }, [object, model]);

  return null;
}

export default Bowl;
