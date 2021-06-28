import React, { useEffect } from "react";
import { gradient } from "@three/materials";
import * as THREE from "three";

// animation w/ react-spring: https://codesandbox.io/embed/react-three-fiber-gestures-08d22?codemirror=1

const Torus: React.FC<{ scene: any; camera: any; renderer: any; }> = ({ scene, camera, renderer }) => {
  useEffect(() => {
    const geometry = new THREE.TorusGeometry();
    const material = new THREE.ShaderMaterial( gradient('hotpink', 'yellow') );
    const torus = new THREE.Mesh( geometry, material );
    scene.add( torus );
    const animate = function () {
      requestAnimationFrame( animate );

      torus.rotation.x += 0.01;
      torus.rotation.y += 0.01;

      renderer.render( scene, camera );
    };

    animate();
    console.log('added')
  }, []);
  return null;
}

export default Torus;