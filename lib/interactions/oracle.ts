import { IAnimation, IInteraction, IKeyframe } from "@types";
import * as THREE from "three";

const interactionMap: {
  [start: string]: string | null
} = {
  'underwater': 'abovewater',
  'abovewater': 'welcome',
  'welcome': 'welcomed'
}

const startFrom = Object.keys(interactionMap)[0];

const rawKeyframeData = (): { [key: string]: IKeyframe } => {
  const underwater = {
    rotation: [0, Math.PI, 0],
    position: [0, -6, 0]
  }
  const abovewater = {
    rotation: [0, 0, 0],
    position: [0, 0, 0]
  }
  return {
    underwater,
    abovewater
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
      rotation: getQuaternion(rawKeyframeData()[name].rotation),
      position: rawKeyframeData()[name].position
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
    'abovewater': trackData(getKeyframe('underwater'), getKeyframe('abovewater')),
    'underwater': trackData(getKeyframe('abovewater'), getKeyframe('underwater')),
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
  const abovewater = () => {
    const clip = new THREE.AnimationClip('abovewater', -1, getKeyframeTracks()['abovewater']);
    play(clip);
  }
  const underwater = () => {
    const clip = new THREE.AnimationClip('underwater', -1, getKeyframeTracks()['underwater']);
    play(clip);
  }
  return {
    abovewater,
    underwater,
    welcomed: underwater
  }
}

const animations = {
  rawKeyframeData,
  playAnimation
}

export {
  interactionMap,
  startFrom,
  animations
}