import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useGLTF, useInteraction } from "@hooks";
import { ILoadedObject } from "@types";
import { transformObject, initialState, loadObject } from "@utils";
import { interactions } from "./interactions";
import { tusksConfig } from "./textures";

const Pedestal: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const { blueprint, animations } = interactions;
  const { interact } = useInteraction(model, sceneComponents, interactions);

  const object = useGLTF('gltf/pedestal.glb', {
    'tusks': tusksConfig({ interact })
  });

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
    loadObject(object, sceneComponents, setLoaded);
    setModel(object);
  }, [object, model]);

  return null;
}

export default Pedestal;
