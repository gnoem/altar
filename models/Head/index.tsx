import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useAnimation, useGLTF } from "@hooks";
import { ILoadedObject } from "@types";
import { loadObject } from "@utils";

const Head: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const object = useGLTF('gltf/head.glb');
  const { toggleAnimation } = useAnimation(model, 'sinkdown', {
    'sinkdown': 'riseup',
    'riseup': 'sinkdown'
  }, animations);
  useEffect(() => {
    if (!object || model) return;
    object.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    object.rotation.y = Math.PI;
    object.position.y = -6;
    object.castShadow = true;
    object.name = 'head';
    object.userData = {
      tick: (delta: number) => {
        /* const radiansPerSecond = THREE.MathUtils.degToRad(30);
        object.rotation.x += radiansPerSecond * delta; */
      },
      onClick: toggleAnimation
    }
    loadObject(object, sceneComponents, null, setLoaded);
    setModel(object);
  }, [object, model]);
  return null;
}

const getKeyframeTracks = () => {
  const times = [0, 3];
  const yAxis = new THREE.Vector3( 0, 1, 0 );
  const initial = {
    rotation: new THREE.Quaternion().setFromAxisAngle( yAxis, Math.PI ),
    position: [0, -6, 0]
  }
  const final = {
    rotation: new THREE.Quaternion().setFromAxisAngle( yAxis, 0 ),
    position: [0, 0, 0]
  }
  const trackData = (initial: any, final: any) => {
    const rotationKF = new THREE.QuaternionKeyframeTrack(
      '.quaternion',
      times,
      [
        initial.rotation.x, initial.rotation.y, initial.rotation.z, initial.rotation.w,
        final.rotation.x, final.rotation.y, final.rotation.z, final.rotation.w
      ],
    );
    const positionKF = new THREE.VectorKeyframeTrack(
      '.position',
      times,
      [
        ...initial.position,
        ...final.position
      ]
    );
    return [
      rotationKF,
      positionKF
    ]
  }
  return {
    'riseup': trackData(initial, final),
    'sinkdown': trackData(final, initial)
  }
}

const animations = (mixer: THREE.AnimationMixer): {
  [key: string]: () => void
} => {
  const play = (action: THREE.AnimationAction) => {
    action.setLoop(THREE.LoopOnce, 0);
    action.clampWhenFinished = true;
    action.play();
  }
  const riseup = () => {
    const clip = new THREE.AnimationClip('riseup', -1, getKeyframeTracks()['riseup']);
    const action = mixer.clipAction(clip);
    play(action);
  }
  const sinkdown = () => {
    const clip = new THREE.AnimationClip('sinkdown', -1, getKeyframeTracks()['sinkdown']);
    const action = mixer.clipAction(clip);
    play(action);
  }
  return {
    riseup,
    sinkdown
  }
}

export default Head;
