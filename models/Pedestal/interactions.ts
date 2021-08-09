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
    position: [0, -1.5, 50],
    scale: [1, 1, 1]
  }
  const underwater = createKeyframeFromDelta(abovewater, {
    position: [0, -15, 0]
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