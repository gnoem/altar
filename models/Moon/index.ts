import * as THREE from "three";
import { IObjectComponentProps, SceneObject } from "@types";
import { transformObject, createMaterialFromTextures } from "@utils";
import { defineMoonMaterial } from "./textures";
import { useAddObject } from "@hooks";

const geometry = new THREE.SphereGeometry(7, 64, 64);
const moon = new THREE.Mesh(geometry);

const Moon: React.FC<IObjectComponentProps> = ({ name, sceneComponents }): null => {

  useAddObject(moon, sceneComponents, (object: SceneObject): void => {
    const obj = (object as THREE.Mesh);
    obj.material = createMaterialFromTextures(defineMoonMaterial());
    transformObject.position(obj, [0, 70, 200]);
    transformObject.scale(obj, [7, 7, 7]);
    obj.name = name;
    obj.userData.tick = (delta: number): void => {
      obj.rotation.y += (delta * 0.07);
    }
  });

  return null;
}

export default Moon;