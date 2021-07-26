import { useAddObject, useGLTF, useInteraction } from "@hooks";
import { ILoadedObject } from "@types";
import { transformObject, getInitialState } from "@utils";
import { interactions } from "./interactions";
import { tusksConfig } from "./textures";

const Pedestal: React.FC<ILoadedObject> = ({ name, sceneComponents }) => {
  const object = useGLTF('gltf/pedestal.glb', {
    'tusks': tusksConfig()
  });

  const { blueprint, animations } = interactions;
  const { interact } = useInteraction(object, sceneComponents, interactions);

  useAddObject(object, sceneComponents, (object: any) => {
    const initialKeyframe = animations.animationKeyframes()[getInitialState(blueprint)];
    transformObject.position(object, initialKeyframe.position);
    transformObject.rotation(object, initialKeyframe.rotation);
    object.name = name;
    object.userData.hoverCursor = 'pointer';
    object.userData.events = {
      click: () => {
        interact?.();
        if (object?.userData?.hoverCursor) {
          object.userData.hoverCursor = '';
        }
      }
    }
  });

  return null;
}

export default Pedestal;
