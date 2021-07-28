import { IInteraction, IInteractionMap, IKeyframeMap } from "@types";
import { getAnimationData } from "@utils";
import { createKeyframeFromDelta } from "@utils/interactions";

const blueprint: IInteractionMap = {
  'underwater': {
    steps: ['abovewater'],
    times: [3]
  }
}

const animationKeyframes = (): IKeyframeMap => {
  const abovewater = {
    rotation: [0, 0, 0],
    position: [0, 3.5, 50],
    scale: [1, 1, 1]
  }
  const underwater = createKeyframeFromDelta(abovewater, {
    position: [0, -22.5, 0]
  });
  return {
    underwater,
    abovewater
  }
}

export const interactions: IInteraction = {
  blueprint,
  animations: getAnimationData(animationKeyframes)
}