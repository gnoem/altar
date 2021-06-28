import React from "react";
import { Head } from "@models";
import { useScene } from "./logic";
import { useState } from "react";

const Scene: React.FC = (): JSX.Element => {
  const [sceneRef, createSceneRef] = useState<HTMLDivElement | null>(null);
  const { scene, camera, renderer } = useScene(sceneRef);
  return (
    <div ref={createSceneRef}>
      {scene && <Head {...{ scene, camera, renderer }} />}
    </div>
  )
}

export default Scene;