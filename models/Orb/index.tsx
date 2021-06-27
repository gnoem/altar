import React, { Suspense, useEffect } from "react";
import { useGLTF } from "@hooks";

const Orb: React.FC = (): JSX.Element => {
  const scene = useGLTF('gltf/orb.glb');
  useEffect(() => {
    if (!scene) return;
    scene.position.z = 5;
  }, [scene]);
  return (
    <Suspense fallback={null}>
      {scene && <primitive object={scene} />}
    </Suspense>
  )
}

export default Orb;