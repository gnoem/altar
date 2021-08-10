import { useEffect } from "react";
import * as THREE from "three";
import { IMeshComponentProps } from "@types";
import { createMaterialFromTextures, defineMaterial, transformObject } from "@utils";

const Base: React.FC<IMeshComponentProps> = ({ mesh, name }): null => {

  useEffect(() => {
    if (!mesh) return;
    const textures = {
      'bumpMap': 'textures/base4.png'
    }
    const createMaterial = defineMaterial(THREE.MeshPhongMaterial, {
      bumpScale: 0.35,
      color: 0x0B0B0B,
      specular: 0x661144,
      shininess: 20
    });
    mesh.name = name;
    mesh.material = createMaterialFromTextures({ textures, createMaterial });
  }, [mesh]);

  return null;
}

export default Base;