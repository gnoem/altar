import React, { useEffect } from "react";
import * as THREE from "three";
import { gradient } from "@three/materials";
import { ILoadedObject } from "@types";
import { loadObject } from "@utils";

// animation w/ react-spring: https://codesandbox.io/embed/react-three-fiber-gestures-08d22?codemirror=1

const Torus: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  useEffect(() => {
    const geometry = new THREE.TorusGeometry();
    const material = new THREE.ShaderMaterial(gradient('hotpink', 'yellow'));
    const torus = new THREE.Mesh(geometry, material);
    const animation = () => {
      torus.rotation.x += 0.01;
      torus.rotation.y += 0.01;
    }
    loadObject(torus, sceneComponents, animation, setLoaded);
  }, []);
  return null;
}

export default Torus;