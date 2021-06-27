import React, { Suspense, useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from "@hooks";

const Head: React.FC = (): JSX.Element => {
  const model = useGLTF('gltf/head.glb');
  useEffect(() => {
    if (!model) return;
    model.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        // console.log(obj.material);
      }
    });
  }, [model]);
  return (
    <Suspense fallback={null}>
      {model && <primitive object={model} />}
    </Suspense>
  )
}

export default Head;