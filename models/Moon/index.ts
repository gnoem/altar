import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useLoadTextures } from "@hooks";
import { ILoadedObject, ILoadTextureInput } from "@types";
import { castModel, loadObject, defineMaterial } from "@utils";

const getTextureData = (): ILoadTextureInput => {
  const textures = {
    bumpMap: 'textures/ceres.png',
    map: 'textures/vibrant.png',
  }
  
  const createMaterial = defineMaterial(THREE.MeshPhongMaterial, {
    bumpScale: 0.2,
    color: 0xFFFFFF
  });

  return {
    textures,
    createMaterial
  }
}

const Moon: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);

  const geometry = new THREE.SphereGeometry(7, 64, 64);
  const material = useLoadTextures(getTextureData());
  
  useEffect(() => {
    if (model || (material === 'loading')) return;
    const moon = new THREE.Mesh(geometry, material);
    castModel.position(moon, [0, 70, 200]);
    castModel.scale(moon, [7, 7, 7]);
    moon.userData.tick = (delta: number) => {
      moon.rotation.y += (delta * 0.07);
    }
    loadObject(moon, sceneComponents, setLoaded);
    setModel(moon);
  }, [material]);

  return null;
}

export default Moon;