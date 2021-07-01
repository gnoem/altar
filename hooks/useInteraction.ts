import { useEffect, useState } from "react";
import * as THREE from "three";
import { IInteraction } from "@types";

const useInteraction = (
  model: any,
  { interactionMap, startFrom, animations }: IInteraction
) => {
  const [interacted, setInteracted] = useState<number | null>(null);
  const [state, setState] = useState<string | null>(startFrom);
  // todo add "history" - array of strings representing past states in order
  const { createMixer } = useAnimation(model, state, animations);
  const [map] = useState<{ [key: string]: string | null }>(interactionMap); // eventually expose setMap to model component?

  useEffect(() => {
    if (!model) return;
    if (!interacted) return createMixer();
    setState(prevState => prevState ? map[prevState] : null);
    setInteracted(null);
  }, [interacted]);

  return {
    state,
    next: () => setInteracted(Date.now()),
    interact: () => setInteracted(Date.now())
  }
}

const useAnimation = (model: any, state: any, animations: any) => {
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (!mixer || !state) return;
    animations.playAnimation(mixer)[state]?.();
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