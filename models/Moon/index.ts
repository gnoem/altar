import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { ILoadedObject } from "@types";
import { castModel, loadObject, setMaterial } from "@utils";
import { useLoadTexture } from "@hooks";

const Moon: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);

  const geometry = new THREE.SphereGeometry(2, 64, 64);
  const applyMaterial = setMaterial(THREE.MeshPhongMaterial, 'bumpMap', {
    bumpScale: 0.7,
    color: 0x465A5D,
    specular: 0x669098,
    shininess: 0
  });

  const texture = useLoadTexture('textures/moon.jpg', applyMaterial);
  
  useEffect(() => {
    if (model || (texture === 'loading')) return;
    const moon = new THREE.Mesh(geometry, texture);
    castModel.position(moon, [0, 30, 100]);
    castModel.scale(moon, [7, 7, 7]);
    moon.userData.tick = (delta: number) => {
      moon.rotation.y += (delta * 0.1);
    }
    loadObject(moon, sceneComponents, setLoaded);
    setModel(moon);
  }, [texture]);

  return null;
}

export default Moon;