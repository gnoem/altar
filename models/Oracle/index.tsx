import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useGLTF, useInteraction } from "@hooks";
import { interactions } from "./interactions";
import { ILoadedObject } from "@types";
import { transformObject, initialState, loadObject } from "@utils";

const Head: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const object = useGLTF('gltf/oracle.glb');

  const { blueprint, animations } = interactions;
  const { interact } = useInteraction(model, sceneComponents, interactions);

  useEffect(() => {
    if (!object || model) return;
    object.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    const initialKeyframe = animations.animationKeyframes()[initialState(blueprint)];
    transformObject.position(object, initialKeyframe.position);
    transformObject.rotation(object, initialKeyframe.rotation);
    object.castShadow = true;
    object.name = 'oracle';
    object.userData.hoverCursor = 'pointer';
    object.userData.events = {
      click: interact
    }
    loadObject(object, sceneComponents, setLoaded);
    setModel(object);
  }, [object, model]);

  return null;
}

export default Head;
