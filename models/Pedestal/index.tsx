import { useState } from "react";
import { useAddObject, useGLTF, useInteraction } from "@hooks";
import { ILoadedObject, IMeshesObject, IMeshComponentProps } from "@types";
import { transformObject, getInitialState, createMeshComponent, meshRegistration } from "@utils";
import { Tusks } from "./components";
import { interactions } from "./interactions";

const components: { [name: string]: React.FC<IMeshComponentProps> } = {
  tusks: Tusks
}

const Pedestal: React.FC<ILoadedObject> = ({ name, sceneComponents }) => {
  const [meshes, setMeshes] = useState<IMeshesObject>({});
  const names = Object.keys(components);

  const object = useGLTF('gltf/pedestal.glb', meshRegistration(names, setMeshes));

  const { blueprint, animations } = interactions;
  const { interact } = useInteraction(object, sceneComponents, interactions);

  const configObject = (object: any): void => {
    const initialKeyframe = animations.animationKeyframes()[getInitialState(blueprint)];
    transformObject.position(object, initialKeyframe.position);
    transformObject.rotation(object, initialKeyframe.rotation);
    object.name = name;
  }

  const configChildMeshes = (object: THREE.Mesh): void => {
    object.userData.hoverCursor = 'pointer';
    object.userData.events = {
      click: () => {
        interact?.();
        if (object?.userData?.hoverCursor) {
          object.userData.hoverCursor = '';
        }
      }
    }
  }

  useAddObject(object, sceneComponents, configObject, configChildMeshes);

  return object
    ? <>{names.map(createMeshComponent({ meshes, components }))}</>
    : null;
}

export default Pedestal;
