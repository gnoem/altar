import * as THREE from "three";
import { ILoadedObject } from "@types";
import { transformObject, createMaterialFromTextures } from "@utils";
import { defineMoonMaterial } from "./textures";
import { useAddObject } from "@hooks";

const geometry = new THREE.SphereGeometry(7, 64, 64);
const material = createMaterialFromTextures(defineMoonMaterial());
const moon = new THREE.Mesh(geometry, material);

const Moon: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {

  useAddObject(moon, sceneComponents, setLoaded, (object: any) => {
    transformObject.position(object, [0, 70, 200]);
    transformObject.scale(object, [7, 7, 7]);
    object.userData.tick = (delta: number) => {
      object.rotation.y += (delta * 0.07);
    }
  });

  return null;
}

export default Moon;