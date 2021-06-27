/* eslint-disable global-require */
import React, { useEffect } from "react";
import { Homepage } from "@layouts";
import { Canvas, useThree } from "@react-three/fiber";
import { Head } from "@models";

// orbit controls: https://codesandbox.io/s/orbitcontrols-react-three-fiber-forked-pd51x?file=/src/index.js

const Altar: React.FC = (): JSX.Element => {
  return (
    <Homepage>
      <Canvas>
        <Scene />
      </Canvas>
    </Homepage>
  )
}

const CameraController = () => {
  const { camera, gl } = useThree();
  const { OrbitControls } = require("three/examples/jsm/controls/OrbitControls");
  useEffect(() => {
    camera.position.z = 20;
    const controls = new OrbitControls(camera, gl.domElement);
    controls.minDistance = 3;
    controls.maxDistance = 20;
    return () => {
      controls.dispose();
    };
  }, [camera, gl]);
  return null;
};

const Scene: React.FC = (): JSX.Element => {
  return (
    <>
      <CameraController />
      <Head />
      <ambientLight intensity={0.1} />
      <directionalLight color="white" position={[0, 5, 5]} />
    </>
  )
}

export default Altar;