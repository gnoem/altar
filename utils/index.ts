import * as THREE from "three";
import { ILoadTextureInput, ISimpleObject, ITextureMap, IThreeScene, ThreeMaterial } from "@types";
import { useEffect, useState } from "react";

export const mutateStateArray = (update: ((array: any[]) => void) | null) => (prevArray: React.SetStateAction<any>) => {
  const arrayToReturn = [...prevArray];
  update?.(arrayToReturn);
  return arrayToReturn;
}

export const last = (array: any[]) => {
  return array[array.length - 1];
}

export const randomNumberBetween = (min: number, max: number, decimalPlaces: number = 0): number => {
  const randomDecimal = Math.random() * (max - min) + min;
  const roundingFactor = 10 ** decimalPlaces;
  return Math.round(randomDecimal * roundingFactor) / roundingFactor;
}

export const setModelPosition = (model: any, [x, y, z]: number[]): void => {
  Object.assign(model.position, { x, y, z });
}

export const setModelRotation = (model: THREE.Mesh, [x, y, z]: number[]) => {
  const euler = new THREE.Euler(...[x, y, z]);
  model.setRotationFromEuler(euler);
}

export const castModel: {
  [property: string]: (model: any, [x, y, z]: number[]) => void
} = {
  position: (model: any, [x, y, z]: number[]): void => {
    Object.assign(model.position, { x, y, z });
  },
  rotation: (model: any, [x, y, z]: number[]) => {
    const euler = new THREE.Euler(...[x, y, z]);
    model.setRotationFromEuler(euler);
  },
  scale: (model: any, [x, y, z]: number[]): void => {
    Object.assign(model.scale, { x, y, z });
  }
}

export const loadObject = (
  model: any,
  sceneComponents: IThreeScene,
  setLoaded: (value: boolean) => void,
  //animation?: (model: any) => void
) => {
  const { scene, camera, renderer, loop } = sceneComponents;
  if (!(scene && camera && renderer && loop)) return;
  scene.add(model);
  loop.add(model);
  setLoaded(true);
}

export const loadMaterialFromTextures = ({ textures, createMaterial }: ILoadTextureInput): ThreeMaterial => {

  let material: ThreeMaterial;

  const texturesArray = Object.entries(textures);
  const textureLoader = new THREE.TextureLoader();

  const getLoadedTextures = () => {
    const loadedTextures = texturesArray.reduce((obj: any, [map, path]: any): any => {
      const texture = textureLoader.load(path, (texture: THREE.Texture) => {
        texture.name = map;
        texture.encoding = THREE.sRGBEncoding;
        texture.flipY = false;
      });
      obj[map] = texture;
      return obj;
    }, {});
    return loadedTextures;
  }

  const loadedTextures = getLoadedTextures();
  material = createMaterial(loadedTextures);

  return material;
}

export const defineMaterial = (Material: any, params: ISimpleObject) => (textures: ITextureMap) => {
  return new Material({
    ...textures,
    ...params
  });
}