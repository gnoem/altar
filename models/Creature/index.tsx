import React, { Suspense, useEffect } from "react";
import { useGLTF } from "@hooks";

const Creature: React.FC = (): JSX.Element => {
  const scene = useGLTF('gltf/creature.glb');
  useEffect(() => {
    if (!scene) return;
  }, [scene]);
  return (
    <Suspense fallback={null}>
      {scene && <primitive object={scene} />}
    </Suspense>
  )
}

export default Creature;