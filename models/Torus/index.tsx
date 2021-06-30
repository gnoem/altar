import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { gradient, animations } from "@lib";
import { ILoadedObject } from "@types";
import { loadObject } from "@utils";
import { useAnimation } from "@hooks";

// animation w/ react-spring: https://codesandbox.io/embed/react-three-fiber-gestures-08d22?codemirror=1

const setPosition = (model: any, [x, y, z]: number[]): void => {
  Object.assign(model.position, { x, y, z });
}

const { animationMap, playAnimation } = animations.riseFromWater;

const Torus: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const { toggleAnimation } = useAnimation(model, animationMap, playAnimation);
  useEffect(() => {
    if (model) return;
    const geometry = new THREE.TorusGeometry(1, 0.5, 64, 64);
    const material = new THREE.ShaderMaterial(gradient('hotpink', 'yellow'));
    const torus = new THREE.Mesh(geometry, material);
    setPosition(torus, [0, -6, 0]);
    /* const yQuat = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 3 );
    const xQuat = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI / 3 );
    const finalQuat = yQuat.multiply(xQuat);
    torus.setRotationFromQuaternion(finalQuat);
    console.log(torus.quaternion); */
    torus.userData = {
      onClick: toggleAnimation
    }
    loadObject(torus, sceneComponents, null, setLoaded);
    setModel(torus);
  }, []);
  return null;
}

export default Torus;