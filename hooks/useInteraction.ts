import { useEffect, useState } from "react";
import * as THREE from "three";
import { IAnimationData, IDialogue, IInteraction, IInteractionDef, IThreeScene } from "@types";
import { last } from "@utils";

interface IInteract {
  state?: IInteractionDef | string;
  next?: () => void;
  interact?: () => void;
  castState?: (state: IInteractionDef) => void;
}

const useInteraction = (
  model: any,
  sceneComponents: IThreeScene,
  { blueprint, startFrom, animations, dialogue }: IInteraction
): IInteract => {
  // todo add "history" - array of strings representing past states in order
  const [interacted, setInteracted] = useState<number | IInteractionDef | null>(null);
  const [state, setState] = useState<IInteractionDef | string>(startFrom);
  const { createMixer } = useAnimation(model, state, animations, startFrom);

  const interact = (customState?: IInteractionDef) => {
    setInteracted(customState ?? Date.now());
  }

  const castState = ({ steps, times }: IInteractionDef) => {
    // todo something if steps.length !== times.length or if keyframes don't exist for any of the steps
    // also sort times array  here and also in the other function where I have to worry about this
    setInteracted({ steps, times });
  }

  useEffect(() => {
    if (!model) return;
    if (!interacted) return createMixer();
    // can either follow blueprint via interact()...
    if (typeof interacted === 'number') {
      setState(prevState => {
        const valueToReturn = (typeof prevState === 'string')
          ? blueprint[prevState] // only true if starting
          : blueprint[last(prevState.steps)];
        return valueToReturn ?? prevState;
      });
    // ...or cast state directly, e.g. from dialog
    } else if (interacted.steps && interacted.times) {
      setState(interacted);
    }
    setInteracted(null);
  }, [interacted]);

  useDialogue(dialogue, {
    state,
    next: () => interact(),
    castState
  }, sceneComponents);

  return {
    interact
  }
}

const useAnimation = (
  model: any,
  state: IInteractionDef | string,
  { animationKeyframes, playAnimation }: IAnimationData,
  startFrom: string
): { createMixer: () => void } => {
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [prevAnimation, setPrevAnimation] = useState<string>(startFrom);

  useEffect(() => {
    if (!mixer || typeof state === 'string') return;
    if (state.steps.some(step => !animationKeyframes()[step])) return; // if any steps don't have corresponding keyframe definitions
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

const useDialogue = (
  dialogue: IDialogue,
  { state, next, castState }: IInteract,
  { scene, camera, renderer }: IThreeScene
) => {
  useEffect(() => {
    if (!(scene && camera && renderer)) return;
    if (typeof state === 'string') return;
    const currentState = last(state!.steps);
    dialogue(scene, next!, castState!)[currentState]?.();
  }, [state]);
}

export default useInteraction;