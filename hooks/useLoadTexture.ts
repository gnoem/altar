import { useEffect, useState } from "react";
import * as THREE from "three";

const useLoadTexture = (materialPath: string, createMaterial?: any): any => {
  const [material, setMaterial] = useState<any>('loading');

  useEffect(() => {
    if (!materialPath) return;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(materialPath, (texture: any) => {
      texture.encoding = THREE.sRGBEncoding;
      texture.flipY = false;
      const loadedMaterial = createMaterial(texture);
      setMaterial(loadedMaterial);
    });
  }, []);

  return material;
}

export default useLoadTexture;