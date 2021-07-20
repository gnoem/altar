import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useGLTF, useInteraction, useLoadTexture } from "@hooks";
import { interactions } from "@lib";
import { ILoadedObject } from "@types";
import { castModel, loadObject, setMaterial } from "@utils";

const Tusk: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);

  const applyMaterial = setMaterial(THREE.MeshPhongMaterial, 'bumpMap', {
    bumpScale: 0.1,
    color: 0x5D5046,
    specular: 0xBEB4AE,
    shininess: 5
  });

  const texture = useLoadTexture('textures/bone2.png', applyMaterial);
  const object = useGLTF('gltf/tusks.glb', texture);

  const interactionName = 'tusks';
  const interaction = interactions[interactionName];
  const { startFrom, animations } = interaction;
  const { interact } = useInteraction(model, sceneComponents, interaction);

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
    object.userData.events = {
      click: interact
    }
    loadObject(object, sceneComponents, setLoaded);
    setModel(object);
  }, [object, model]);

  return null;
}

export default Tusk;
