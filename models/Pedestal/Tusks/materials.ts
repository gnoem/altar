import * as THREE from "three";
import { ILoadTextureInput } from "@types";
import { defineMaterial } from "@utils";

export const defineTusksMaterial = (): ILoadTextureInput => {
  const textures = {
    'bumpMap': 'textures/tusks.png'
  }
  
  const createMaterial = defineMaterial(THREE.MeshPhongMaterial, {
    bumpScale: 0.1,
    color: 0x5D5046,
    specular: 0xBEB4AE,
    shininess: 5
  });

  return {
    textures,
    createMaterial
  }
}