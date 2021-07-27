import { useEffect, useState } from "react";
import * as THREE from "three";
import { ILoadTextureInput, ILoadedTextureMap, ThreeMaterial } from "@types";

const useLoadTextures = ({ textures, createMaterial }: ILoadTextureInput): ThreeMaterial | 'loading' => {
  const [loadedTextures, setLoadedTextures] = useState<ILoadedTextureMap | null>(null);
  const [material, defineMaterial] = useState<ThreeMaterial | 'loading'>('loading');

  const texturesArray = Object.entries(textures);

  useEffect(() => {
    if (!textures) return;
    const textureLoader = new THREE.TextureLoader();
    texturesArray.forEach(([map, path]) => {
      textureLoader.load(path, (texture: THREE.Texture) => {
        texture.encoding = THREE.sRGBEncoding;
        texture.flipY = false;
        setLoadedTextures((prevState: ILoadedTextureMap | null): ILoadedTextureMap => ({
          ...prevState,
          [map]: texture
        }));
      });
    });
  }, []);

  useEffect(() => {
    if (!loadedTextures) return;
    if (Object.entries(loadedTextures).length !== texturesArray.length) return;
    const finishedMaterial = createMaterial(loadedTextures);
    defineMaterial(finishedMaterial);
  }, [loadedTextures]);

  return material;
}

export default useLoadTextures;