import React, { useCallback, useState, useEffect, useMemo } from "react";
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
  const [objects, setObjects] = useState<ISceneObject[] | null>(null);
  const [sceneRef, createSceneRef] = useState<HTMLDivElement | null>(null);
  const sceneComponents: IThreeScene = useScene(sceneRef);
  useEffect(() => {
    const array = objectNames.map((name: string) => ({
      name,
      loaded: false
    }));
    setObjects(array);
  }, [objectNames]);
  const isReady = useMemo(() => {
    return (sceneComponents && objects?.every(obj => obj.loaded));
  }, [sceneComponents, objects]);
  const loadObjects = useCallback(() => {
    if (!objects || !sceneComponents) return null;
    return objects.map(({ name }) => {
      const setLoaded = (value: boolean): void => {
        setObjects(mutateStateArray((array) => {
          const index = array.find(obj => obj.name === name);
          return array.splice(index, 1, {
            name,
            loaded: value
          });
        }));
      }
      return objectMap[name]({ sceneComponents, setLoaded });
    });
  }, [objects, sceneComponents]);
  return (
    <>
      <div ref={createSceneRef} className={isReady ? '' : 'loading'}>
        {loadObjects()}
      </div>
    </>
  )
}

export default Scene;