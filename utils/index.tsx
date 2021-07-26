import * as THREE from "three";
import { ILoadTextureInput, IMeshComponentsObject, IMeshRegistrationObject, IMeshesObject, ISimpleObject, ITextureMap, IThreeScene, ThreeMaterial, IMeshRegistrationFunction, IMeshComponentProps } from "@types";
import React, { Dispatch, SetStateAction } from "react";
export { getInitialState, getAnimationData } from "./interactions";
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
  //setLoaded: (value: boolean) => void,
  //animation?: (model: any) => void
) => {
  const { scene, camera, renderer, loop } = sceneComponents;
  if (!(scene && camera && renderer && loop)) return;
  scene.add(model);
  loop.add(model);
  //setLoaded(true);
}


/* ADVANCED MULTI-MESH GLTF CONFIG
if we have a GLTF composed of multiple objects/meshes, we may want to have fine-grained control over individual meshes, including letting each mesh have its own state and side effects and make use of custom hooks like useInteraction. to do so we can create a React component for each mesh, which takes the mesh object as a prop and manages its state, side effects, etc. working example: a multi-mesh GLTF BowlOfFruit with Bowl, Apple, Bananas, Peach as meshes

meshRegistration takes as its two arguments (1) an array of strings corresponding to the names of the meshes in the GLTF file (['bowl', 'apple', 'bananas', 'peach']), and (2) a setMeshes function to 'register' each mesh in the parent (BowlOfFruit) component
useGLTF will use the return object to loop through the GLTF children whose type === 'Mesh' and call registerMesh on each one so that the meshes get stored in the parent and can then be used to generate a React component for each mesh using createMeshComponent
*/

export const meshRegistration = (
  meshNames: string[],
  setMeshes: Dispatch<SetStateAction<IMeshesObject>>
): IMeshRegistrationObject => {
  return meshNames.reduce((obj: ISimpleObject, meshName: string): IMeshRegistrationObject => {
    const registerMesh: IMeshRegistrationFunction = (object: THREE.Mesh): void => {
      setMeshes((prevState: IMeshesObject): IMeshesObject => ({
        ...prevState,
        [meshName]: object
      }));
    }
    obj[meshName] = registerMesh;
    return obj;
  }, {});
}

export const createMeshComponent = (
  config: (object: THREE.Mesh) => void,
  { meshes, components }: { meshes: IMeshesObject, components: IMeshComponentsObject }
) => {
  return (meshName: string): JSX.Element => {
    const Component: React.FC<IMeshComponentProps> = components[meshName];
    const mesh: THREE.Mesh = meshes[meshName];
    config(mesh);
    return <Component {...{
      key: meshName,
      name: meshName,
      mesh
    }} />;
  }
}