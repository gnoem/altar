import * as THREE from "three";
import { ILoadTextureInput, ISimpleObject, ITextureMap, ThreeMaterial } from "@types";

export const createMaterialFromTextures = ({ textures, createMaterial }: ILoadTextureInput): ThreeMaterial => {

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