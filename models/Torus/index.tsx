import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { gradient, animations } from "@lib";
import { ILoadedObject } from "@types";
import { castModel, loadObject } from "@utils";
import { useAnimation } from "@hooks";

// animation w/ react-spring: https://codesandbox.io/embed/react-three-fiber-gestures-08d22?codemirror=1

const { animationMap, startFrom, rawKeyframeData, playAnimation } = animations.riseFromWater;

const Torus: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const { toggleAnimation } = useAnimation(model, animationMap, playAnimation);
  useEffect(() => {
    if (model) return;
    const geometry = new THREE.TorusGeometry(1, 0.5, 64, 64);
    const material = new THREE.ShaderMaterial(gradient('hotpink', 'yellow'));
    const torus = new THREE.Mesh(geometry, material);
    castModel.position(torus, rawKeyframeData[startFrom].position);
    castModel.rotation(torus, rawKeyframeData[startFrom].rotation);
    torus.userData = {
      onClick: toggleAnimation
    }
    loadObject(torus, sceneComponents, null, setLoaded);
    setModel(torus);
  }, []);
  return null;
}

export default Torus;