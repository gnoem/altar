import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useAnimation, useGLTF } from "@hooks";
import { animations } from "@lib";
import { ILoadedObject } from "@types";
import { castModel, loadObject } from "@utils";

const Head: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const object = useGLTF('gltf/head.glb');

  const animationName = 'riseFromWater';
  const animation = animations[animationName];
  const { startFrom, rawKeyframeData } = animation;
  const { toggleAnimation } = useAnimation(model, animation);

  useEffect(() => {
    if (!object || model) return;
    object.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    const initial = rawKeyframeData[startFrom];
    castModel.position(object, initial.position);
    castModel.rotation(object, initial.rotation);
    object.castShadow = true;
    object.name = 'head';
    object.userData.hoverCursor = 'pointer';
    object.userData.events = {
      click: toggleAnimation
    }
    loadObject(object, sceneComponents, null, setLoaded);
    setModel(object);
  }, [object, model]);

  return null;
}

export default Head;
