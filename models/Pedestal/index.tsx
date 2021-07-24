import React, { useState } from "react";
import { useAddObject, useGLTF, useInteraction } from "@hooks";
import { ILoadedObject } from "@types";
import { transformObject, initialState } from "@utils";
import { interactions } from "./interactions";
import { tusksConfig } from "./textures";

const Pedestal: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  
  const { blueprint, animations } = interactions;
  const { interact } = useInteraction(model, sceneComponents, interactions);

  const object = useGLTF('gltf/pedestal.glb', {
    'tusks': tusksConfig({ interact })
  });

  useAddObject(object, sceneComponents, setLoaded, (object: any) => {
    const initialKeyframe = animations.animationKeyframes()[initialState(blueprint)];
    transformObject.position(object, initialKeyframe.position);
    transformObject.rotation(object, initialKeyframe.rotation);
    setModel(object);
  });

  return null;
}

export default Pedestal;
