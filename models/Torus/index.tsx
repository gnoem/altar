import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { materials } from "@lib";
import { ILoadedObject } from "@types";
import { transformObject, initialState, loadObject } from "@utils";
import { useInteraction } from "@hooks";
import { interactions } from "../Oracle/interactions";

// animation w/ react-spring: https://codesandbox.io/embed/react-three-fiber-gestures-08d22?codemirror=1

const Torus: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  
  const { blueprint, animations } = interactions;
  const { interact } = useInteraction(model, sceneComponents, interactions);
  
  useEffect(() => {
    if (model) return;
    const geometry = new THREE.TorusGeometry(1, 0.5, 64, 64);
    const material = new THREE.ShaderMaterial(materials.gradient('hotpink', 'yellow'));
    const torus = new THREE.Mesh(geometry, material);
    const initial = animations.animationKeyframes()[initialState(blueprint)];
    transformObject.position(torus, initial.position);
    transformObject.rotation(torus, initial.rotation);
    transformObject.scale(torus, initial.scale);
    torus.userData.hoverCursor = 'pointer';
    torus.userData.events = {
      click: interact
    }
    loadObject(torus, sceneComponents, setLoaded);
    setModel(torus);
  }, []);

  return null;
}

export default Torus;