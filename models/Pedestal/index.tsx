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

  useAddObject(object, sceneComponents, (object: any) => {
    const initialKeyframe = animations.animationKeyframes()[getInitialState(blueprint)];
    transformObject.position(object, initialKeyframe.position);
    transformObject.rotation(object, initialKeyframe.rotation);
    object.name = name;
  });

  const config = (object: THREE.Mesh) => {
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

  if (!object) return null;
  return (
    <>
      {names.map(createMeshComponent(config, { meshes, components }))}
    </>
  )
}

export default Pedestal;
