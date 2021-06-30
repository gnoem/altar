import * as THREE from "three";

const animationMap: {
  [start: string]: string | null
} = {
  'sinkdown': 'riseup',
  'riseup': 'sinkdown'
}

const getKeyframeTracks = () => {
  const times = [0, 3];
  const axis = new THREE.Vector3( 0, 1, 0 );
  const underwater = {
    rotation: new THREE.Quaternion().setFromAxisAngle( axis, Math.PI ),
    position: [0, -6, 0]
  }
  const abovewater = {
    rotation: new THREE.Quaternion().setFromAxisAngle( axis, 0 ),
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
    'riseup': trackData(underwater, abovewater),
    'sinkdown': trackData(abovewater, underwater)
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

const riseFromWater = {
  animationMap,
  playAnimation
}

export default riseFromWater;