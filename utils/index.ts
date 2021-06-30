import { IThreeScene } from "@types";

export const mutateStateArray = (update: (array: any[]) => void) => (prevArray: React.SetStateAction<any>) => {
  const arrayToReturn = [...prevArray];
  update(arrayToReturn);
  return arrayToReturn;
}

export const randomNumberBetween = (min: number, max: number, decimalPlaces: number = 0): number => {
  const randomDecimal = Math.random() * (max - min) + min;
  const roundingFactor = 10 ** decimalPlaces;
  return Math.round(randomDecimal * roundingFactor) / roundingFactor;
}

export const loadObject = (
  model: any,
  sceneComponents: IThreeScene,
  animation: ((model: any) => void) | null,
  setLoaded: (value: boolean) => void
) => {
  const { scene, camera, renderer, loop } = sceneComponents;
  if (!(scene && camera && renderer && loop)) return;
  scene.add(model);
  /* const animate = () => {
    animation?.(model);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate(); */
  loop.add(model);
  setLoaded(true);
}

export const animateObject = (
  model: any,
  sceneComponents: IThreeScene,
  animation: ((model: any) => void) | null,
) => {
  const { scene, camera, renderer } = sceneComponents;
  if (!(scene && camera && renderer)) return;
  let anim;
  const animate = () => {
    animation?.(model);
    renderer.render(scene, camera);
    anim = requestAnimationFrame(animate);
  }
  //if (anim && !animation) cancelAnimationFrame(anim);
  animate();
}