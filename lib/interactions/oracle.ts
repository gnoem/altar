import { IInteractionDef, IKeyframe } from "@types";
import * as THREE from "three";

const interactionMap: {
  [start: string]: IInteractionDef
} = {
  'underwater': {
    steps: ['abovewater'],
    times: [3]
  },
  'abovewater': {
    steps: ['welcome'],
    times: [3]
  },
  'welcome': {
    steps: ['welcomed'],
    times: [3]
  },
  'welcomed': {
    steps: ['help'],
    times: [2]
  },
  'help': {
    steps: ['welcomed'],
    times: [2]
  }
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
  const welcomed = {
    rotation: [0, Math.PI, 0],
    position: [0, -5, 0]
  }
  const help = {
    rotation: [-Math.PI / 4, 0, 0],
    position: [0, -3, 0]
  }
  return {
    underwater,
    abovewater,
    welcomed,
    help
  }
}

const getKeyframeTracks = (states: string[], times: number[]) => {
  // todo- if states.length and times.length differ, still do it with necessary adjustments but console.warn
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
  const generateTracks = (keyframes: any[]) => {
    const rotationKF = new THREE.QuaternionKeyframeTrack(
      '.quaternion',
      times,
      keyframes.map(keyframe => {
        return [keyframe.rotation.x, keyframe.rotation.y, keyframe.rotation.z, keyframe.rotation.w]
      }).flat()
    );
    const positionKF = new THREE.VectorKeyframeTrack(
      '.position',
      times,
      keyframes.map(keyframe => {
        return [...keyframe.position]
      }).flat()
    );
    return [
      rotationKF,
      positionKF
    ]
  }
  const keyframes = states.map(state => getKeyframe(state));
  return generateTracks(keyframes);
}

const playAnimation = (mixer: THREE.AnimationMixer, states: string[], times: number[]): void => {
  const [origin, target] = states;
  const play = (clip: THREE.AnimationClip) => {
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 0);
    action.clampWhenFinished = true;
    action.play();
  }
  const clip = new THREE.AnimationClip(`${origin}-to-${target}`, -1, getKeyframeTracks(states, times));
  play(clip);
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