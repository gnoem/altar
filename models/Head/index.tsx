import React, { useEffect } from "react";
import * as THREE from "three";
import { useAnimation, useGLTF } from "@hooks";
import { ILoadedObject } from "@types";
import { loadObject } from "@utils";
import { useState } from "react";

const Head: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const object = useGLTF('gltf/head.glb');
  const { toggleAnimation } = useAnimation(model, sceneComponents, () => {
    while (model.position.y <= 5) {
      model.position.y += 0.01;
    }
  });
  useEffect(() => {
    if (!object || model) return;
    object.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
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
