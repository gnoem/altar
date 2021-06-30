import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { materials, animations } from "@lib";
import { ILoadedObject } from "@types";
import { castModel, loadObject } from "@utils";
import { useAnimation } from "@hooks";

// animation w/ react-spring: https://codesandbox.io/embed/react-three-fiber-gestures-08d22?codemirror=1

const Torus: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  
  const animationName = 'riseFromWater';
  const animation = animations[animationName];
  const { startFrom, rawKeyframeData } = animation;
  const { toggleAnimation } = useAnimation(model, animation);
  
  useEffect(() => {
    if (model) return;
    const geometry = new THREE.TorusGeometry(1, 0.5, 64, 64);
    const material = new THREE.ShaderMaterial(materials.gradient('hotpink', 'yellow'));
    const torus = new THREE.Mesh(geometry, material);
    const initial = rawKeyframeData[startFrom];
    castModel.position(torus, initial.position);
    castModel.rotation(torus, initial.rotation);
    torus.userData.hoverCursor = 'pointer';
    torus.userData.events = {
      click: toggleAnimation
    }
    loadObject(torus, sceneComponents, null, setLoaded);
    setModel(torus);
  }, []);

  return null;
}

export default Torus;