import { useEffect, useState } from "react";
import * as THREE from "three";
import { IThreeScene } from "@types";

const useAddObject = (
  object: any,
  { scene, loop }: IThreeScene,
  config: (object: any) => void
): void => {
  const [added, setAdded] = useState<boolean>(false);

  useEffect(() => {
    if (!(object && scene && loop) || added) return;
    config(object);
    object.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    scene.add(object);
    loop.add(object);
    scene.userData.setLoaded(object.name);
    setAdded(true);
  }, [object, added]);
}

export default useAddObject;