import * as THREE from "three";
import { ILoadTextureInput, ISimpleObject } from "@types";
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

export const tusksConfig = ({ interact }: ISimpleObject) => (object?: THREE.Mesh) => {
  const events = {
    click: () => {
      interact?.();
      if (object?.userData?.hoverCursor) {
        object.userData.hoverCursor = '';
      }
    }
  }
  return {
    name: 'tusks',
    material: createMaterialFromTextures(defineTusksMaterial()),
    userData: {
      hoverCursor: 'pointer',
      events
    }
  }
}