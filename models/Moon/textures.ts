import * as THREE from "three";
import { ILoadTextureInput } from "@types";
import { defineMaterial } from "@utils";

export const defineMoonMaterial = (): ILoadTextureInput => {
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