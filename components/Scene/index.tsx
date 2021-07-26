import React, { useState, useEffect } from "react";
import styles from "./Scene.module.css";
import { Loader } from "@components";
import { useMouseEvent, useScene } from "@hooks";
import { Pedestal, Oracle, Torus, Moon } from "@models";
import { ILoadedObject, IThreeScene } from "@types";
import { mutateStateArray } from "@utils";
import Bowl from "@models/Bowl";
import { useVerifyLoaded } from "./hooks";

export interface ISceneObject {
  name: string;
  loaded: boolean;
}

const objectsMap: {
  [objectName: string]: any
} = {
  'oracle': Oracle,
  'torus': Torus,
  'pedestal': Pedestal,
  'moon': Moon,
  'bowl': Bowl
}

const Scene: React.FC<{ objects: string[]; }> = ({ objects: objectNames }): JSX.Element => {
  const [sceneRef, createSceneRef] = useState<HTMLDivElement | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  
  const sceneComponents: IThreeScene = useScene(sceneRef);
  const { loading, setLoaded } = useVerifyLoaded(objectNames, sceneComponents);
  useMouseEvent(sceneComponents);
  
  useEffect(() => { // prepare scene before loading any objects
    if (!sceneComponents?.scene) return;
    sceneComponents.scene.userData.setLoaded = setLoaded; // make setLoaded function available to scene children
    setReady(true);
  }, [sceneComponents]);

  const createObjects = (objectName: string): JSX.Element | null => {
    const { scene, camera, renderer } = sceneComponents;
    if (!(scene && camera && renderer) || !ready) return null;
    const Element: React.FC<ILoadedObject> = objectsMap[objectName];
    const object: JSX.Element = (
      <Element {...{
        key: objectName,
        name: objectName,
        sceneComponents
      }} />
    )
    return object;
  }

  return (
    <div ref={createSceneRef} className={`${styles.Scene} ${loading ? styles.loading : ''}`}>
      {loading && <Loader />}
      {objectNames.map(createObjects)}
    </div>
  )
}

export default Scene;