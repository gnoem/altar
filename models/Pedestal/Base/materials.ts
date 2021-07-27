import * as THREE from "three";
import { ILoadTextureInput } from "@types";
import { defineMaterial } from "@utils";

export const defineBaseMaterial = (): ILoadTextureInput => {
  const textures = {
    'bumpMap': 'textures/bone2.png'
  }
  
  const createMaterial = defineMaterial(THREE.MeshPhongMaterial, {
    bumpScale: 0.1,
    color: 0x333333
  });

  return {
    textures,
    createMaterial
  }
}