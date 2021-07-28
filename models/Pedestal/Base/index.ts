import { useEffect } from "react";
import * as THREE from "three";
import { IMeshComponentProps } from "@types";
import { createMaterialFromTextures, defineMaterial } from "@utils";

const Base: React.FC<IMeshComponentProps> = ({ mesh, name }): null => {

  useEffect(() => {
    if (!mesh) return;
    const textures = {
      'bumpMap': 'textures/stone3.png'
    }
    const createMaterial = defineMaterial(THREE.MeshPhongMaterial, {
      bumpScale: 0.2,
      color: 0x0B0B0B,
      specular: 0x661144,
      shininess: 20
    });
    mesh.name = name;
    mesh.material = createMaterialFromTextures({ textures, createMaterial });
    //console.log(mesh);
  }, [mesh]);

  return null;
}

export default Base;