import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { gradient } from "@lib";
import { ILoadedObject } from "@types";
import { loadObject } from "@utils";
import { useAnimation } from "@hooks";

// animation w/ react-spring: https://codesandbox.io/embed/react-three-fiber-gestures-08d22?codemirror=1

const Torus: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const { toggleAnimation } = useAnimation(model, 'underwater', {
    'underwater': 'abovewater',
    'abovewater': 'underwater'
  }, getAnimations);
  useEffect(() => {
    if (model) return;
    const geometry = new THREE.TorusGeometry(1, 0.5, 64, 64);
    const material = new THREE.ShaderMaterial(gradient('hotpink', 'yellow'));
    const torus = new THREE.Mesh(geometry, material);
    torus.position.y = 0;
    torus.userData = {
      onClick: toggleAnimation
    }
    loadObject(torus, sceneComponents, null, setLoaded);
    setModel(torus);
  }, []);
  return null;
}

const getAnimations = (mixer: THREE.AnimationMixer): {
  [key: string]: () => void
} => {
  const times = [0, 3];
  const yAxis = new THREE.Vector3( 0, 1, 0 );
  let rFinal = new THREE.Quaternion().setFromAxisAngle( yAxis, 0 );
  let rInitial = new THREE.Quaternion().setFromAxisAngle( yAxis, Math.PI );
  let pInitial = [0, -6, 0];
  let pFinal = [0, 0, 0];
  const play = (action: THREE.AnimationAction) => {
    action.setLoop(THREE.LoopOnce, 0);
    action.clampWhenFinished = true;
    action.play();
  }
  const abovewater = () => {
    const rotationKF = new THREE.QuaternionKeyframeTrack(
      '.quaternion',
      times,
      [
        rInitial.x, rInitial.y, rInitial.z, rInitial.w,
        rFinal.x, rFinal.y, rFinal.z, rFinal.w
      ],
    );
    const positionKF = new THREE.VectorKeyframeTrack(
      '.position',
      times,
      [
        ...pInitial,
        ...pFinal
      ]
    );
    const clip = new THREE.AnimationClip('sinkdown', -1, [
      rotationKF,
      positionKF
    ]);
    const action = mixer.clipAction(clip);
    play(action);
  }
  const underwater = () => {
    const rotationKF = new THREE.QuaternionKeyframeTrack(
      '.quaternion',
      times,
      [
        rFinal.x, rFinal.y, rFinal.z, rFinal.w,
        rInitial.x, rInitial.y, rInitial.z, rInitial.w,
      ],
    );
    const positionKF = new THREE.VectorKeyframeTrack(
      '.position',
      times,
      [
        ...pFinal,
        ...pInitial,
      ]
    );
    const clip = new THREE.AnimationClip('riseup', -1, [
      rotationKF,
      positionKF
    ]);
    const action = mixer.clipAction(clip);
    play(action);
  }
  return {
    abovewater,
    underwater
  }
}

export default Torus;