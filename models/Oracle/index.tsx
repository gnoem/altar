import { interactions } from "./interactions";
import { useAddObject, useGLTF, useInteraction } from "@hooks";
import { ILoadedObject } from "@types";
import { transformObject, getInitialState } from "@utils";

const Head: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const object = useGLTF('gltf/oracle.glb');

  const { blueprint, animations } = interactions;
  const { interact } = useInteraction(object, sceneComponents, interactions);

  useAddObject(object, sceneComponents, setLoaded, (object: any) => {
    const initialKeyframe = animations.animationKeyframes()[getInitialState(blueprint)];
    transformObject.position(object, initialKeyframe.position);
    transformObject.rotation(object, initialKeyframe.rotation);
    object.castShadow = true;
    object.name = 'oracle';
    object.userData.hoverCursor = 'pointer';
    object.userData.events = {
      click: interact
    }
  });

  return null;
}

export default Head;
