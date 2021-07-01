import { IKeyframeMap } from "@types";
import * as THREE from "three";

const getKeyframeTracks = (states: string[], times: number[], animationKeyframes: () => IKeyframeMap) => {
  // todo- if states.length and times.length differ, still do it with necessary adjustments but console.warn
  const getQuaternion = (array: number[]) => {
    const euler = new THREE.Euler(...array);
    return new THREE.Quaternion().setFromEuler(euler);
  }
  const getKeyframe = (name: string) => {
    return {
      rotation: getQuaternion(animationKeyframes()[name].rotation),
      position: animationKeyframes()[name].position,
      scale: animationKeyframes()[name].scale,
    }
  }
  const generateTracks = (keyframes: any[]) => {
    const rotationKF = new THREE.QuaternionKeyframeTrack(
      '.quaternion',
      times,
      keyframes.map(keyframe => {
        return [keyframe.rotation.x, keyframe.rotation.y, keyframe.rotation.z, keyframe.rotation.w]
      }).flat()
    )
    const positionKF = new THREE.VectorKeyframeTrack(
      '.position',
      times,
      keyframes.map(keyframe => {
        return [...keyframe.position]
      }).flat()
    )
    const scaleKF = new THREE.VectorKeyframeTrack(
      '.scale',
      times,
      keyframes.map(keyframe => {
        return [...keyframe.scale]
      }).flat()
    )
    return [
      rotationKF,
      positionKF,
      scaleKF
    ]
  }
  const keyframes = states.map(state => getKeyframe(state));
  return generateTracks(keyframes);
}

const animate = (animationKeyframes: () => IKeyframeMap) => {
  return (
    mixer: THREE.AnimationMixer,
    states: string[],
    times: number[],
    loop: boolean = false
  ): void => {
    const play = (clip: THREE.AnimationClip) => {
      const action = mixer.clipAction(clip);
      if (!loop) {
        action.setLoop(THREE.LoopOnce, 0);
        action.clampWhenFinished = true;
      }
      action.play();
    }
    const clip = new THREE.AnimationClip(states.join('-to-'), -1, getKeyframeTracks(states, times, animationKeyframes));
    play(clip);
  }
}

const getAnimationData = (animationKeyframes: () => IKeyframeMap) => {
  return {
    animationKeyframes,
    playAnimation: animate(animationKeyframes)
  }
}

export {
  getAnimationData
}