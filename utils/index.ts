import * as THREE from "three";
import { ILoadTextureInput, ISimpleObject, ITextureMap, IThreeScene, ThreeMaterial } from "@types";
export { initialState, getAnimationData } from "./interactions";
export { createMaterialFromTextures, defineMaterial } from "./materials";

export const mutateStateArray = (update: ((array: any[]) => void) | null) => (prevArray: React.SetStateAction<any>) => {
  const arrayToReturn = [...prevArray];
  update?.(arrayToReturn);
  return arrayToReturn;
}

export const last = (array: any[]): any => {
  return array[array.length - 1];
}

export const randomNumberBetween = (min: number, max: number, decimalPlaces: number = 0): number => {
  const randomDecimal = Math.random() * (max - min) + min;
  const roundingFactor = 10 ** decimalPlaces;
  return Math.round(randomDecimal * roundingFactor) / roundingFactor;
}

export const transformObject: {
  [property: string]: (model: any, [x, y, z]: number[]) => void
} = {
  position: (model: any, [x, y, z]: number[]): void => {
    Object.assign(model.position, { x, y, z });
  },
  rotation: (model: any, [x, y, z]: number[]): void => {
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