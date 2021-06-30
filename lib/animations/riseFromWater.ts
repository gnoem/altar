import { IAnimation, IKeyframe } from "@types";
import * as THREE from "three";

const animationMap: {
  [start: string]: string | null
} = {
  'sinkdown': 'riseup',
  'riseup': 'sinkdown'
}

const startFrom = Object.keys(animationMap)[0];

const rawKeyframeData: { [key: string]: IKeyframe } = {
  sinkdown: {
    rotation: [0, Math.PI, 0],
    position: [0, -6, 0]
  },
  riseup: {
    rotation: [0, 0, 0],
    position: [0, 0, 0]
  }
}

const getKeyframeTracks = () => {
  const times = [0, 3];
  const getQuaternion = (array: number[]) => {
    const euler = new THREE.Euler(...array);
    return new THREE.Quaternion().setFromEuler(euler);
  }
  const getKeyframe = (name: string) => {
    return {
      rotation: getQuaternion(rawKeyframeData[name].rotation),
      position: rawKeyframeData[name].position
    }
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
    'riseup': trackData(getKeyframe('sinkdown'), getKeyframe('riseup')),
    'sinkdown': trackData(getKeyframe('riseup'), getKeyframe('sinkdown'))
  }
}

const playAnimation = (mixer: THREE.AnimationMixer): {
  [key: string]: () => void
} => {
  const play = (clip: THREE.AnimationClip) => {
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 0);
    action.clampWhenFinished = true;
    action.play();
  }
  const riseup = () => {
    const clip = new THREE.AnimationClip('riseup', -1, getKeyframeTracks()['riseup']);
    play(clip);
  }
  const sinkdown = () => {
    const clip = new THREE.AnimationClip('sinkdown', -1, getKeyframeTracks()['sinkdown']);
    play(clip);
  }
  return {
    riseup,
    sinkdown
  }
}

const riseFromWater: IAnimation = {
  animationMap,
  startFrom,
  rawKeyframeData,
  playAnimation
}

export default riseFromWater;