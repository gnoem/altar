import React, { useState, useEffect, useMemo } from "react";
import styles from "./Scene.module.css";
import { useScene } from "@hooks";
import { Head, Torus } from "@models";
import { ILoadedObject, IThreeScene } from "@types";
import { mutateStateArray } from "@utils";

interface ISceneObject {
  name: string;
  loaded: boolean;
}

const objectMap: { [objectName: string]: React.FC<ILoadedObject> } = {
  'head': (props) => <Head key="head" {...props} />,
  'torus': (props) => <Torus key="torus" {...props} />
}

const Scene: React.FC<{ objects: string[]; }> = ({ objects: objectNames }): JSX.Element => {
  const [objects, setObjects] = useState<React.FC<ILoadedObject>[] | null>(null);
  const [objectsList, setObjectsList] = useState<ISceneObject[] | null>(null);
  const [sceneRef, createSceneRef] = useState<HTMLDivElement | null>(null);
  const sceneComponents: IThreeScene = useScene(sceneRef);
  useEffect(() => {
    const array = objectNames.map((name: string) => ({
      name,
      loaded: false
    }));
    setObjectsList(array);
  }, [objectNames]);
  const isReady = useMemo(() => {
    return (sceneComponents && objectsList?.every(obj => obj.loaded));
  }, [sceneComponents, objectsList]);
  const { scene, camera, renderer } = sceneComponents;
  useEffect(() => {
    if (!objectsList || !sceneComponents) return;
    if (!(scene && camera && renderer)) return;
    if (objects) return;
    const loadObjects = (): React.FC<ILoadedObject>[] | null => {
      return objectsList.map(({ name, loaded }): any => {
        if (loaded) return null;
        const setLoaded = (value: boolean): void => {
          setObjectsList(mutateStateArray((array) => {
            const index = array.findIndex(obj => obj.name === name);
            return array.splice(index, 1, {
              name,
              loaded: value
            });
          }));
        }
        return objectMap[name]({ sceneComponents, setLoaded });
      });
    }
    setObjects(loadObjects());
  }, [objects, objectsList, sceneComponents]);
  return (
    <>
      <div ref={createSceneRef} className={`${styles.Scene} ${isReady ? '' : styles.loading}`}>
        {objects}
      </div>
    </>
  )
}

export default Scene;