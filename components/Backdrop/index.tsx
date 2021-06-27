import React, { useEffect, useState } from "react";
import styles from "./Backdrop.module.css";
import { randomNumberBetween } from "@utils";

const transitionDuration = 5000;

const Backdrop: React.FC<{ motion?: boolean }> = ({ motion }): JSX.Element => {
  const blobColors = motion ? [
    'rgb(234, 223, 255)',
    'rgb(213, 205, 255)',
  ] : [];
  return (
    <div className={styles.container}>
      {blobColors.map(color => <Blob key={color} {...{ color, motion }} />)}
    </div>
  )
}

const Blob: React.FC<{ color: string; motion: boolean | undefined; }> = ({ color, motion }): JSX.Element => {
  const randomHue = (): number => randomNumberBetween(-40, 40);
  const randomOpacity = (): number => randomNumberBetween(0.8, 1, 1);
  const randomSize = (): number => randomNumberBetween(0.5, 1.5, 2);
  const randomTranslation = (): number => randomNumberBetween(-50, 50);
  const [hue, setHue] = useState<number>(randomHue());
  const [opacity, setOpacity] = useState<number>(randomOpacity());
  const [size, setSize] = useState<{ x: number, y: number }>({ x: randomSize(), y: randomSize() });
  const [translation, setTranslation] = useState<{ x: number, y: number }>({ x: randomTranslation(), y: randomTranslation() });
  useEffect(() => {
    if (!motion) return;
    const shift = () => {
      setHue(randomHue());
      setOpacity(randomOpacity());
      setSize({ x: randomSize(), y: randomSize() });
      setTranslation({ x: randomTranslation(), y: randomTranslation() });
    }
    setInterval(() => {
      shift();
    }, transitionDuration)
  }, [motion]);
  const transparentize = (rgb: string): string => {
    // gradients that fade to transparent are interpreted/interpolated as ending in 'transparent black' in safari
    // this is a workaround
    return rgb.replace('rgb', 'rgba').split(')')[0] + ', 0)';
  }
  return (
    <div className={styles.blob} style={{
      background: `radial-gradient(${color} 0%, ${transparentize(color)} 70%)`,
      filter: `hue-rotate(${hue}deg)`,
      opacity: `${opacity}`,
      transitionDuration: `${transitionDuration}ms`,
      transform: `scale(${size.x}, ${size.y}) translate3d(${translation.x}%, ${translation.y}%, 0)`
    }}></div>
  )
}

export default Backdrop;