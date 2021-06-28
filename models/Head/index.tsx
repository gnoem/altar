import React, { useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from "@hooks";
import { ILoadedObject } from "@types";
import { loadObject } from "@utils";

const Head: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const model = useGLTF('gltf/head.glb');
  useEffect(() => {
    if (!model) return;
    model.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    model.castShadow = true;
    const animation = () => {
      model.rotation.y += -0.01;
    }
    loadObject(model, sceneComponents, animation, setLoaded)
  }, [model]);
  return (
    <>
    </>
  )
}

export default Head;