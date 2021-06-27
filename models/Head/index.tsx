import React, { Suspense, useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from "@hooks";

const Head: React.FC<{ scene: any }> = ({ scene }) => {
  const model = useGLTF('gltf/head.glb');
  useEffect(() => {
    if (!model) return;
    model.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        // console.log(obj.material);
      }
    });
    scene.add(model);
  }, [model]);
  return null;
  /* return (
    <Suspense fallback={null}>
      {model && <primitive object={model} />}
    </Suspense>
  ) */
}

export default Head;