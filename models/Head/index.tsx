import React, { useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from "@hooks";

const Head: React.FC<{ scene: any; camera: any; renderer: any; }> = ({ scene, camera, renderer }) => {
  const model = useGLTF('gltf/head.glb');
  useEffect(() => {
    if (!model) return;
    model.traverse((obj: any) => {
      if ( obj instanceof THREE.Mesh ) {
        // do something
        obj.castShadow = true;
        obj.receiveShadow = true;

      }
    });
    model.castShadow = true;
    scene.add(model);
    const animate = () => {
      requestAnimationFrame( animate );
      model.rotation.y += -0.01;
      renderer.render( scene, camera );
    }
    animate();
  }, [model]);
  return null;
}

export default Head;