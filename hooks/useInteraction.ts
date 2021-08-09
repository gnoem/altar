import { useEffect, useState } from "react";
import * as THREE from "three";
import { IAnimationData, IInteractionEventMap, IInteraction, IInteractionDef, IThreeScene, SceneObject, IInteractionOptions } from "@types";
import { getInitialState, last } from "@utils";

interface IInteract {
  currentState?: IInteractionDef | string;
  next?: (customState?: IInteractionOptions) => void;
  interact?: () => void;
}

const useInteraction = (
  object: SceneObject | null,
  sceneComponents: IThreeScene,
  { blueprint, animations, events }: IInteraction
): IInteract => {
  // todo add "history" - array of strings representing past states in order
  const [currentState, setCurrentState] = useState<IInteractionDef | string>(getInitialState(blueprint));
  const [nextState, setNextState] = useState<IInteractionOptions | null>(null);
  const { createMixer } = useAnimation(object, currentState, animations, getInitialState(blueprint));

  const next = (customState?: IInteractionOptions): void => {
    // todo something if steps.length !== times.length or if keyframes don't exist for any of the steps
    // also sort times array  here and also in the other function where I have to worry about this
    const defaultOptions = {
      passive: false
    }
    const getNextState = (): IInteractionOptions => {
      if (customState?.steps && customState?.times) {
        const newState = Object.assign(defaultOptions, customState);
        return (newState as IInteractionDef);
      }
      return {
        blueprint: true,
        ...customState
      }
    }
    setNextState(getNextState());
  }

  useEffect(() => {
    if (!object) return;
    if (!nextState) return createMixer();
    if (object?.userData?.preventInteractions) return;

    // update object.userData.preventInteractions to prevent further interaction until this one is complete
    const preventFurtherInteractions = (newState: IInteractionDef): void => {
      const duration = last(newState?.times);
      if (!duration) return;
      object.userData.preventInteractions = true;
      setTimeout(() => {
        object.userData.preventInteractions = false;
      }, duration * 1000);
    }

    if (nextState.steps && nextState.times) {
      // if a new state has been called manually
      if (!nextState.passive) preventFurtherInteractions(nextState as IInteractionDef);
      setCurrentState(nextState as IInteractionDef);
    } else if (nextState.blueprint) {
      // if a new state has been called via interact() or next() with no arguments, follow blueprint in interactions file
      setCurrentState(prevState => {
        const newState: IInteractionDef | undefined = (typeof prevState === 'string')
          ? blueprint[prevState] // only true if starting
          : blueprint[last(prevState.steps)];
        if (!newState?.passive) preventFurtherInteractions(newState);
        return newState ?? prevState;
      });
    }

    setNextState(null);
  }, [nextState]);

  const manageState = {
    currentState,
    next
  }

  useInteractionEvents(events, manageState, {
    ...sceneComponents,
    object
  });

  return {
    interact: next
  }
}

const useAnimation = (
  object: SceneObject | null,
  currentState: IInteractionDef | string,
  { animationKeyframes, playAnimation }: IAnimationData,
  initialAnimationState: string
): {
  createMixer: () => void
} => {
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [prevState, setPrevState] = useState<string>(initialAnimationState);

  useEffect(() => {
    if (!mixer || typeof currentState === 'string') return;
    if (currentState.steps.some(step => !animationKeyframes()[step])) return; // if any steps don't have corresponding keyframe definitions
    if (prevState === last(currentState.steps)) return;
    playAnimation(mixer, [prevState, ...currentState.steps], [0, ...currentState.times]);
    setPrevState(last(currentState.steps));
    if (object) {
      object.userData.tick = (delta: number) => mixer.update(delta);
    }
  }, [currentState, mixer]);

  const createMixer = () => {
    if (!object) return;
    const newMixer = new THREE.AnimationMixer(object);
    setMixer(newMixer);
  }

  return {
    createMixer
  }
}

const useInteractionEvents = (
  eventsMap: IInteractionEventMap | null = null,
  { currentState, next }: IInteract,
  { object, scene, camera, renderer }: IThreeScene
): void => {

  useEffect(() => {
    if (!(eventsMap && object && scene && camera && renderer)) return;
    if (typeof currentState === 'string') return;
    const stateName = last(currentState!.steps);
    eventsMap(object!, scene, next!)[stateName]?.(currentState!);
  }, [currentState]);

}

export default useInteraction;