import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useAnimation, useGLTF } from "@hooks";
import { animations } from "@lib";
import { ILoadedObject } from "@types";
import { castModel, loadObject } from "@utils";

const { animationMap, startFrom, rawKeyframeData, playAnimation } = animations.riseFromWater;

const Head: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const object = useGLTF('gltf/head.glb');
  const { toggleAnimation } = useAnimation(model, animationMap, playAnimation);
  useEffect(() => {
    if (!object || model) return;
    object.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    castModel.position(object, rawKeyframeData[startFrom].position);
    castModel.rotation(object, rawKeyframeData[startFrom].rotation);
    object.castShadow = true;
    object.name = 'head';
    object.userData = {
      onClick: toggleAnimation
    }
    loadObject(object, sceneComponents, null, setLoaded);
    setModel(object);
  }, [object, model]);
  return null;
}

export default Head;
