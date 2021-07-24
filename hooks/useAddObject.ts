import { useEffect, useState } from "react";
import * as THREE from "three";
import { IThreeScene } from "@types";

const useAddObject = (
  object: any,
  { scene, loop }: IThreeScene,
  setLoaded: any,
  config: (object: any) => void
): void => {
  const [added, setAdded] = useState<boolean>(false);

  useEffect(() => {
    if (!object || added) return;
    if (!(scene && loop)) return;
    object.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    config(object);
    scene.add(object);
    loop.add(object);
    setLoaded(true);
    setAdded(true);
  }, [object, added]);
}

export default useAddObject;