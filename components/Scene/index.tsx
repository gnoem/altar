import React, { useState, useEffect } from "react";
import styles from "./Scene.module.css";
import { Loader } from "@components";
import { useMouseEvent, useScene } from "@hooks";
import { Pedestal, Oracle, Torus, Moon } from "@models";
import { IThreeScene } from "@types";
import { mutateStateArray } from "@utils";
import Bowl from "@models/Bowl";

interface ISceneObject {
  name: string;
  loaded: boolean;
  setLoaded: (value: boolean) => void;
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

const useVerifyLoaded = (objectNames: string[], sceneComponents: IThreeScene): {
  loading: boolean,
  objectsList: ISceneObject[] | null
} => {
  const [loading, setLoading] = useState<boolean>(true);
  const [objectsList, setObjectsList] = useState<ISceneObject[] | null>(null);
  useEffect(() => {
    const array = objectNames.map((name: string): ISceneObject => ({
      name,
      loaded: false,
      setLoaded: (value: boolean): void => {
        setObjectsList(mutateStateArray((array) => {
          const index = array.findIndex(obj => obj.name === name);
          return array.splice(index, 1, {
            name,
            loaded: value
          });
        }));
      }
    }));
    setObjectsList(array);
  }, [objectNames]);
  useEffect(() => {
    if (!sceneComponents || !objectsList) return;
    const isReady = objectsList.every(obj => obj.loaded);
    const delay = 3000;
    if (isReady) {
      setTimeout(() => {
        setLoading(false);
      }, delay);
    }
  }, [sceneComponents, objectsList]);
  return {
    loading,
    objectsList
  }
}

const Scene: React.FC<{ objects: string[]; }> = ({ objects: objectNames }): JSX.Element => {
  const [sceneRef, createSceneRef] = useState<HTMLDivElement | null>(null);
  const sceneComponents: IThreeScene = useScene(sceneRef);
  const { loading, objectsList } = useVerifyLoaded(objectNames, sceneComponents);
  useMouseEvent(sceneComponents);
  const includeElement = (objectName: string): JSX.Element | null => {
    const { scene, camera, renderer } = sceneComponents;
    if (!objectsList || !(scene && camera && renderer)) return null;
    const shouldInclude = objectsList.some((object: ISceneObject): boolean => object.name === objectName);
    const Element = objectsMap[objectName];
    const object = (
      <Element {...{
        key: objectName,
        sceneComponents,
        setLoaded: objectsList!.find(object => object.name === objectName)!.setLoaded
      }} />
    )
    return shouldInclude ? object : null;
  }
  return (
    <div ref={createSceneRef} className={`${styles.Scene} ${loading ? styles.loading : ''}`}>
      {loading && <Loader />}
      {objectNames.map(includeElement)}
    </div>
  )
}

export default Scene;