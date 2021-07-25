import * as THREE from "three";
import { ILoadTextureInput, IMeshConfig } from "@types";
import { defineMaterial, createMaterialFromTextures } from "@utils";

const defineTusksMaterial = (): ILoadTextureInput => {
  const textures = {
    'bumpMap': 'textures/bone2.png'
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

export const tusksConfig = () => (object: any): IMeshConfig => {
  return {
    name: 'tusks',
    material: createMaterialFromTextures(defineTusksMaterial()),
    userData: {
      events: {
        click: () => {
          console.log(object);
        }
      }
    }
  }
}