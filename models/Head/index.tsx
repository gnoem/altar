import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useGLTF, useInteraction } from "@hooks";
import { interactions } from "@lib";
import { ILoadedObject } from "@types";
import { castModel, loadObject } from "@utils";

const Head: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const object = useGLTF('gltf/head.glb');

  const interactionName = 'oracle';
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
    const initial = animations.rawKeyframeData()[startFrom];
    castModel.position(object, initial.position);
    castModel.rotation(object, initial.rotation);
    object.castShadow = true;
    object.name = 'head';
    object.userData.hoverCursor = 'pointer';
    object.userData.events = {
      click: interact
    }
    loadObject(object, sceneComponents, null, setLoaded);
    setModel(object);
  }, [object, model]);

  return null;
}

export default Head;
