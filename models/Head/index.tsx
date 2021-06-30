import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useAnimation, useGLTF } from "@hooks";
import { animations } from "@lib";
import { ILoadedObject } from "@types";
import { loadObject } from "@utils";

const { animationMap, playAnimation } = animations.riseFromWater;

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
    object.rotation.y = Math.PI;
    object.position.y = -6;
    object.castShadow = true;
    object.name = 'head';
    object.userData = {
      tick: (delta: number) => {
        /* const radiansPerSecond = THREE.MathUtils.degToRad(30);
        object.rotation.x += radiansPerSecond * delta; */
      },
      onClick: toggleAnimation
    }
    loadObject(object, sceneComponents, null, setLoaded);
    setModel(object);
  }, [object, model]);
  return null;
}

export default Head;
