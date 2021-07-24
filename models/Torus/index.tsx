import * as THREE from "three";
import { materials } from "@lib";
import { ILoadedObject } from "@types";
import { transformObject, initialState } from "@utils";
import { useAddObject, useInteraction } from "@hooks";
import { interactions } from "../Oracle/interactions";

// animation w/ react-spring: https://codesandbox.io/embed/react-three-fiber-gestures-08d22?codemirror=1

const geometry = new THREE.TorusGeometry(1, 0.5, 64, 64);
const material = new THREE.ShaderMaterial(materials.gradient('hotpink', 'yellow'));
const torus = new THREE.Mesh(geometry, material);

const Torus: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {

  const { blueprint, animations } = interactions;
  const { interact } = useInteraction(torus, sceneComponents, interactions);
  
  useAddObject(torus, sceneComponents, setLoaded, (object: any) => {
    const initial = animations.animationKeyframes()[initialState(blueprint)];
    transformObject.position(object, initial.position);
    transformObject.rotation(object, initial.rotation);
    transformObject.scale(object, initial.scale);
    object.userData.hoverCursor = 'pointer';
    object.userData.events = {
      click: interact
    }
  });

  return null;
}

export default Torus;