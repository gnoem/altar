import { interactions } from "./interactions";
import { useAddObject, useGLTF, useInteraction } from "@hooks";
import { IObjectComponentProps, SceneObject } from "@types";
import { transformObject, getInitialState } from "@utils";

const Oracle: React.FC<IObjectComponentProps> = ({ name, sceneComponents }) => {
  const object = useGLTF('gltf/oracle.glb');

  const { blueprint, animations } = interactions;
  const { interact } = useInteraction(object, sceneComponents, interactions);

  const configObject = (object: SceneObject): void => {
    const initialKeyframe = animations.animationKeyframes()[getInitialState(blueprint)];
    transformObject.position(object, initialKeyframe.position);
    transformObject.rotation(object, initialKeyframe.rotation);
    object.name = name;
  }

  const configChildMeshes = (object: THREE.Mesh): void => {
    object.userData.hoverCursor = 'pointer';
    object.userData.events = {
      click: interact
    }
  }

  useAddObject(object, sceneComponents, configObject, configChildMeshes);

  return null;
}

export default Oracle;
