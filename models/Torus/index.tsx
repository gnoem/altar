import * as THREE from "three";
import { materials } from "@lib";
import { IObjectComponentProps, SceneObject } from "@types";
import { transformObject, getInitialState } from "@utils";
import { useAddObject, useInteraction } from "@hooks";
import { interactions } from "../Oracle/interactions";

// animation w/ react-spring: https://codesandbox.io/embed/react-three-fiber-gestures-08d22?codemirror=1

const geometry = new THREE.TorusGeometry(1, 0.5, 64, 64);
const material = new THREE.ShaderMaterial(materials.gradient('hotpink', 'yellow'));
const torus = new THREE.Mesh(geometry, material);

const Torus: React.FC<IObjectComponentProps> = ({ name, sceneComponents }): null => {

  const { blueprint, animations } = interactions;
  const { interact } = useInteraction(torus, sceneComponents, interactions);
  
  useAddObject(torus, sceneComponents, (object: SceneObject): void => {
    const initial = animations.animationKeyframes()[getInitialState(blueprint)];
    transformObject.position(object, initial.position);
    transformObject.rotation(object, initial.rotation);
    transformObject.scale(object, initial.scale);
    object.name = name;
    object.userData.hoverCursor = 'pointer';
    object.userData.events = {
      click: interact
    }
  });

  return null;
}

export default Torus;