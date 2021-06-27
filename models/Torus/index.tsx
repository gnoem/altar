import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { gradient } from "@three/materials";

// animation w/ react-spring: https://codesandbox.io/embed/react-three-fiber-gestures-08d22?codemirror=1

const Torus: React.FC = (): JSX.Element => {
  const myMesh = useRef(null);
  const [active, setActive] = useState<boolean>(true);
  useFrame(() => {
    if (!myMesh.current) return;
    if (!active) return;
    // @ts-ignore: Object is possibly 'null'
    myMesh.current.rotation.x += 0.01;
    // @ts-ignore: Object is possibly 'null'
    myMesh.current.rotation.y += 0.03;
    // @ts-ignore: Object is possibly 'null'
    myMesh.current.rotation.z += 0.01;
  });
  return (
    <mesh onClick={() => setActive(a => !a)} ref={myMesh}>
      <torusGeometry args={[5, 0.5, 64, 64]} />
      <shaderMaterial args={[gradient('hotpink', 'yellow')]} />
      {/* <meshPhongMaterial shininess={1000} /> */}
    </mesh>
  )
}

export default Torus;