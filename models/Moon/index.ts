import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { ILoadedObject } from "@types";
import { transformObject, loadObject, createMaterialFromTextures } from "@utils";
import { defineMoonMaterial } from "./textures";

const Moon: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);

  useEffect(() => {
    if (model) return;
    const geometry = new THREE.SphereGeometry(7, 64, 64);
    const material = createMaterialFromTextures(defineMoonMaterial());
    const moon = new THREE.Mesh(geometry, material);
    transformObject.position(moon, [0, 70, 200]);
    transformObject.scale(moon, [7, 7, 7]);
    moon.userData.tick = (delta: number) => {
      moon.rotation.y += (delta * 0.07);
    }
    loadObject(moon, sceneComponents, setLoaded);
    setModel(moon);
  }, []);

  return null;
}

export default Moon;