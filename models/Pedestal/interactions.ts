import { IInteraction, IInteractionDef, IKeyframeMap } from "@types";
import { getAnimationData } from "@utils";

const blueprint: {
  [start: string]: IInteractionDef
} = {
  'underwater': {
    steps: ['abovewater'],
    times: [3]
  }
}

const animationKeyframes = (): IKeyframeMap => {
  const underwater = {
    rotation: [0, 0, 0],
    position: [0, -8, 15],
    scale: [1, 1, 1]
  }
  const abovewater = {
    rotation: [0, 0, 0],
    position: [0, -0.5, 15],
    scale: [1, 1, 1]
  }
  return {
    underwater,
    abovewater
  }
}

export const interactions: IInteraction = {
  blueprint,
  animations: getAnimationData(animationKeyframes),
  dialogue: null
}