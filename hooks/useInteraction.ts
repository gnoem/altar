import { useEffect, useState } from "react";
import * as THREE from "three";
import { IAnimationData, IDialogue, IInteraction, IInteractionDef, IThreeScene } from "@types";
import { last } from "@utils";

interface IInteract {
  state?: IInteractionDef | string;
  next?: () => void;
  interact?: () => void;
}

const useInteraction = (
  model: any,
  sceneComponents: IThreeScene,
  { blueprint, startFrom, animations, dialogue }: IInteraction
): IInteract => {
  const [interacted, setInteracted] = useState<number | null>(null);
  const [state, setState] = useState<IInteractionDef | string>(startFrom);
  // todo add "history" - array of strings representing past states in order
  const { createMixer } = useAnimation(model, state, animations, startFrom);
  //const [map] = useState<{ [key: string]: IInteractionDef }>(blueprint); // eventually expose setMap to model component?

  const interact = () => setInteracted(Date.now());

  useDialogue(dialogue, {
    state,
    next: interact
  }, sceneComponents)

  useEffect(() => {
    if (!model) return;
    if (!interacted) return createMixer();
    setState(prevState => {
      const valueToReturn = (typeof prevState === 'string')
        ? blueprint[prevState] // only true if starting
        : blueprint[last(prevState.steps)];
      return valueToReturn ?? prevState;
    });
    setInteracted(null);
  }, [interacted]);

  return {
    interact
  }
}

const useDialogue = (
  dialogue: IDialogue,
  { state, next }: IInteract,
  { scene, camera, renderer }: IThreeScene
) => {
  useEffect(() => {
    if (!(scene && camera && renderer)) return;
    if (typeof state === 'string') return;
    const currentState = last(state!.steps);
    dialogue(scene, next!)[currentState]?.();
  }, [state]);
}

const useAnimation = (
  model: any,
  state: IInteractionDef | string,
  { rawKeyframeData, playAnimation }: IAnimationData,
  startFrom: string
): { createMixer: () => void } => {
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