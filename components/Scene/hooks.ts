import { IThreeScene } from "@types";
import { mutateStateArray } from "@utils";
import { useEffect, useState } from "react";
import { ISceneObject } from ".";

export const useVerifyLoaded = (objectNames: string[], sceneComponents: IThreeScene): {
  loading: boolean;
  setLoaded: (objectName: string) => void;
} => {
  const loadedObjects = objectNames.map((name: string): ISceneObject => ({
    name,
    loaded: false
  }));

  const [loading, setLoading] = useState<boolean>(true);
  const [objectsList, setObjectsList] = useState<ISceneObject[]>(loadedObjects);

  const setLoaded = (objectName: string): void => {
    setObjectsList(mutateStateArray((array) => {
      const index = array.findIndex(obj => obj.name === objectName);
      return array.splice(index, 1, {
        name: objectName,
        loaded: true
      });
    }));
  }

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
    setLoaded
  }
}