import { useEffect, useState } from "react";
import * as THREE from "three";
import { IThreeScene } from "@types";

const useAnimation = (
  model: any,
  initialState: string,
  statesMap: { [key: string]: string },
  animations: (mixer: THREE.AnimationMixer) => { [key: string]: () => void }
) => {
  const [mixer, setMixer] = useState<any>(null);
  const [clicked, setClicked] = useState<number | null>(null);
  const [state, setState] = useState<string>(initialState);
  useEffect(() => {
    if (!clicked && !model) {
      return;
    } else if (!clicked) {
      const animationMixer = new THREE.AnimationMixer(model);
      setMixer(animationMixer);
      return;
    }
    const getAnimationFrom: { [key: string]: string } = {
      ...statesMap
    }
    setState(prevState => getAnimationFrom[prevState] ?? 'abovewater');
    setClicked(null);
  }, [clicked]);
  useEffect(() => {
    if (!mixer) return;
    animations(mixer)[state]();
    if (model) {
      model.userData.tick = (delta: number) => mixer.update(delta);
    }
  }, [state, mixer]);
  return {
    toggleAnimation: () => setClicked(Date.now())
  }
}

const useAnimationOLD = (model: any, { scene, camera, renderer }: IThreeScene) => {
  const [animation, setAnimation] = useState<any>(null);
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  useEffect(() => {
    if (!(scene && camera && renderer && model)) return;
    const animate = () => {
      animation!(model);
      renderer.render(scene, camera);
      setAnimationFrame(requestAnimationFrame(animate));
    }
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    if (animation) {
      animate();
    }
  }, [animation]);
  return (fn: (() => void) | null) => setAnimation(() => fn);
}

const useAnimationOLDER = (model: any, { scene, camera, renderer }: IThreeScene, animationDef: () => void) => {
  const [active, setActive] = useState<boolean>(false);
  const [clicked, setClicked] = useState<number | null>(null);
  const [animation, setAnimation] = useState<(() => void) | null>(null);
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  useEffect(() => {
    if (!clicked) return;
    setActive(a => !a);
    setClicked(null);
  }, [clicked]);
  useEffect(() => {
    if (!model) return;
    setAnimation(active ? () => animationDef : null);
  }, [model, active]);
  useEffect(() => {
    if (!(scene && camera && renderer)) return;
    const animate = () => {
      animation!();
      renderer.render(scene, camera);
      setAnimationFrame(requestAnimationFrame(animate));
    }
    if (animation) {
      animate();
    } else if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  }, [scene, camera, renderer, animation]);
  return {
    toggleAnimation: () => setClicked(Date.now())
  }
}

export default useAnimation;