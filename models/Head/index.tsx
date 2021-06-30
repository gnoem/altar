import React, { useEffect } from "react";
import * as THREE from "three";
import { useGLTF, useWatchCursor } from "@hooks";
import { ILoadedObject } from "@types";
import { loadObject } from "@utils";
import { useState } from "react";

const Head: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const object = useGLTF('gltf/head.glb');
  //useWatchCursor(model, sceneComponents);
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
    loadObject(object, sceneComponents, null, setLoaded);
    setModel(object);
  }, [object, model]);
  return null;
}

export default Head;
