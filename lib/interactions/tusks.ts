import { IInteractionDef, IKeyframeMap } from "@types";
import * as utils from "./_utils";

const blueprint: {
  [start: string]: IInteractionDef
} = {
  'underwater': {
    steps: ['abovewater'],
    times: [3]
  }
}

const startFrom = Object.keys(blueprint)[0];

const dialogue = null;

const animationKeyframes = (): IKeyframeMap => {
  const underwater = {
    rotation: [0, 0, 0],
    position: [0, -6, 0],
    scale: [1, 1, 1]
  }
  const abovewater = {
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    scale: [1, 1, 1]
  }
  return {
    underwater,
    abovewater
  }
}

const animations = utils.getAnimationData(animationKeyframes);

export {
  blueprint,
  startFrom,
  animations,
  dialogue
}