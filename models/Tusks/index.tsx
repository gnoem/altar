import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useGLTF, useInteraction, useLoadTextures } from "@hooks";
import { interactions } from "@lib";
import { ILoadedObject, ILoadTextureInput } from "@types";
import { castModel, loadObject, defineMaterial } from "@utils";

const getTuskTexture = (): ILoadTextureInput => {
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

const Tusk: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const interactionName = 'tusks';
  const interaction = interactions[interactionName];
  const { startFrom, animations } = interaction;
  const { interact } = useInteraction(model, sceneComponents, interaction);

  const tuskMaterial = useLoadTextures(getTuskTexture());
  const object = useGLTF('gltf/pedestal.glb', {
    'tusks': (object: any) => ({
      material: tuskMaterial,
      userData: {
        hoverCursor: 'pointer',
        events: {
          click: () => {
            interact?.();
            if (object.userData.hoverCursor) {
              object.userData.hoverCursor = '';
            }
          }
        }
      }
    })
  });

  useEffect(() => {
    if (!object || model) return;
    object.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    const initial = animations.animationKeyframes()[startFrom];
    castModel.position(object, initial.position);
    castModel.rotation(object, initial.rotation);
    object.name = 'tusks';
    object.userData.hoverCursor = 'pointer'; // remove after first interaction?
    object.userData.events = {
      click: interact
    }
    loadObject(object, sceneComponents, setLoaded);
    setModel(object);
  }, [object, model]);

  return null;
}

export default Tusk;
