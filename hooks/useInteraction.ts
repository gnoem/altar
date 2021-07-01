import { useEffect, useState } from "react";
import * as THREE from "three";
import { IAnimationData, IInteraction, IInteractionDef } from "@types";
import { last } from "@utils";

const useInteraction = (
  model: any,
  { interactionMap, startFrom, animations }: IInteraction
) => {
  const [interacted, setInteracted] = useState<number | null>(null);
  const [state, setState] = useState<IInteractionDef | string>(startFrom);
  // todo add "history" - array of strings representing past states in order
  const { createMixer } = useAnimation(model, state, animations, startFrom);
  const [map] = useState<{ [key: string]: IInteractionDef }>(interactionMap); // eventually expose setMap to model component?

  useEffect(() => {
    if (!model) return;
    if (!interacted) return createMixer();
    setState(prevState => {
      return (prevState)
        ? (typeof prevState === 'string')
          ? map[prevState]
          : map[last(prevState.steps)] ?? prevState
        : prevState;
    });
    setInteracted(null);
  }, [interacted]);

  return {
    state,
    next: () => setInteracted(Date.now()),
    interact: () => setInteracted(Date.now())
  }
}

const useAnimation = (
  model: any,
  state: IInteractionDef | string,
  { rawKeyframeData, playAnimation }: IAnimationData,
  startFrom: string
) => {
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [prevAnimation, setPrevAnimation] = useState<string>(startFrom);

  useEffect(() => {
    if (!mixer || typeof state === 'string') return;
    if (state.steps.some(step => !rawKeyframeData()[step])) return; // if any steps don't have corresponding keyframe definitions
    if (prevAnimation === last(state.steps)) return;
    playAnimation(mixer, [prevAnimation, ...state.steps], [0, ...state.times]);
    setPrevAnimation(last(state.steps));
    if (model) {
      model.userData.tick = (delta: number) => mixer.update(delta);
    }
  }, [state, mixer]);

  const createMixer = () => {
    const newMixer = new THREE.AnimationMixer(model);
    setMixer(newMixer);
  }

  return {
    createMixer
  }
}

export default useInteraction;