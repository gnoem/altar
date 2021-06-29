import React, { useEffect } from "react";
import * as THREE from "three";
import { gradient } from "@three/materials";
import { ILoadedObject } from "@types";
import { loadObject } from "@utils";
import { useState } from "react";
import { useAnimation } from "@hooks";

// animation w/ react-spring: https://codesandbox.io/embed/react-three-fiber-gestures-08d22?codemirror=1

const Torus: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const { toggleAnimation } = useAnimation(model, sceneComponents, () => {
    const speed = 0.05;
    model.rotation.x += speed * 0.5;
    model.rotation.y += speed;
    model.rotation.z += speed;
    if (model.position.y < 5) {
      model.position.y += 0.01;
    }
  });
  useEffect(() => {
    if (model) return;
    const geometry = new THREE.TorusGeometry(1, 0.5, 64, 64);
    const material = new THREE.ShaderMaterial(gradient('hotpink', 'yellow'));
    const torus = new THREE.Mesh(geometry, material);
    torus.userData = {
      onClick: toggleAnimation
    }
    loadObject(torus, sceneComponents, null, setLoaded);
    setModel(torus);
  }, []);
  return null;
}

export default Torus;