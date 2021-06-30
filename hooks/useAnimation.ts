import { IThreeScene } from "@types";
import { useEffect, useState } from "react";

const useAnimation = (model: any, { scene, camera, renderer }: IThreeScene) => {
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

const useAnimationOLD = (model: any, { scene, camera, renderer }: IThreeScene, animationDef: () => void) => {
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