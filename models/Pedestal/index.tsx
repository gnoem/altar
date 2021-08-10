import { useState } from "react";
import { useAddObject, useGLTF, useInteraction } from "@hooks";
import { IObjectComponentProps, IMeshesObject, IMeshComponentProps, SceneObject } from "@types";
import { transformObject, getInitialState, createMeshComponent, meshRegistration } from "@utils";
import { Tusks, Base } from "./components";
import { interactions } from "./interactions";

const components: { [name: string]: React.FC<IMeshComponentProps> } = {
  tusks: Tusks,
  base: Base
}

const Pedestal: React.FC<IObjectComponentProps> = ({ name, sceneComponents }): JSX.Element | null => {
  const [meshes, setMeshes] = useState<IMeshesObject>({});
  const names = Object.keys(components);

  const object = useGLTF('gltf/pedestal4.glb', meshRegistration(names, setMeshes));

  const { blueprint, animations } = interactions;
  const { interact } = useInteraction(object, sceneComponents, interactions);

  const configObject = (object: SceneObject): void => {
    const initialKeyframe = animations.animationKeyframes()[getInitialState(blueprint)];
    transformObject.position(object, initialKeyframe.position);
    transformObject.rotation(object, initialKeyframe.rotation);
    object.name = name;
  }

  const configChildMeshes = (object: THREE.Mesh): void => {
    object.userData.interactParent = interact;
  }

  const ready = useAddObject(object, sceneComponents, configObject, configChildMeshes);

  return ready
    ? <>{names.map(createMeshComponent({ meshes, components }))}</>
    : null;
}

export default Pedestal;
