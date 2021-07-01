import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { materials, interactions } from "@lib";
import { ILoadedObject } from "@types";
import { castModel, loadObject } from "@utils";
import { useInteraction } from "@hooks";

// animation w/ react-spring: https://codesandbox.io/embed/react-three-fiber-gestures-08d22?codemirror=1

const Torus: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  
  const interactionName = 'oracle';
  const interaction = interactions[interactionName];
  const { startFrom, animations } = interaction;
  const { interact } = useInteraction(model, sceneComponents, interaction);
  
  useEffect(() => {
    if (model) return;
    const geometry = new THREE.TorusGeometry(1, 0.5, 64, 64);
    const material = new THREE.ShaderMaterial(materials.gradient('hotpink', 'yellow'));
    const torus = new THREE.Mesh(geometry, material);
    const initial = animations.animationKeyframes()[startFrom];
    castModel.position(torus, initial.position);
    castModel.rotation(torus, initial.rotation);
    castModel.scale(torus, initial.scale);
    torus.userData.hoverCursor = 'pointer';
    torus.userData.events = {
      click: interact
    }
    loadObject(torus, sceneComponents, null, setLoaded);
    setModel(torus);
  }, []);

  return null;
}

export default Torus;