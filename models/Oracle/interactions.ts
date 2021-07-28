import * as THREE from "three";
import { IInteraction, IInteractionDef, IKeyframeMap } from "@types";
import { getAnimationData } from "@utils";
import { createKeyframeFromDelta } from "@utils/interactions";

const blueprint: {
  [start: string]: IInteractionDef
} = {
  'underwater': {
    steps: ['abovewater'],
    times: [3]
  },
  'abovewater': {
    steps: ['welcome'],
    times: [3]
  },
  'welcome': {
    steps: ['welcomed'],
    times: [3]
  },
  'welcomed': {
    steps: ['help'],
    times: [2]
  },
  'help': {
    steps: ['welcomed'],
    times: [2]
  }
}

const events = (
  scene: THREE.Scene,
  next: () => void
): {
  [state: string]: () => void
} => {
  const welcome = (): void => {
    const name = prompt(`
      hi, welcome to the altar at GNAGUA W16V\n
      its nice to have a visitors!\n
      please enter your name
    `);
    if (!name || ['no', 'nope', 'no thanks', 'no thank you', 'fuck you', 'fuck u'].includes(name.toLowerCase().trim())) {
      alert(`
        thats ok, i understand not wanting to share. stranger danger and all.
      `)
    } else {
      alert(`
        hi ${name} pleasure to make your acquaintance :)
      `)
    }
    alert(`
      im the oracle here, i can help you if you have questions or are not sure how this works.\n
      to start, after you close out of this box, why not try clicking and dragging your cursor to look around?\n
      (this altar is a work in progress - there is almost nothing here yet, but feel free to explore)
    `);
    next();
  }
  const welcomed = (): void => {
    scene.userData.unlock('lookaround');
  }
  return {
    welcome,
    welcomed
  }
}

const animationKeyframes = (): IKeyframeMap => {
  const abovewater = {
    rotation: [0, 0, 0],
    position: [0, 0, -5],
    scale: [1, 1, 1]
  }
  const underwater = createKeyframeFromDelta(abovewater, {
    rotation: [0, Math.PI, 0],
    position: [0, -6, 0]
  });
  const welcomed = createKeyframeFromDelta(abovewater, {
    rotation: [0, Math.PI, 0],
    position: [0, -9, 0]
  });
  return {
    underwater,
    abovewater,
    welcomed
  }
}

export const interactions: IInteraction = {
  blueprint,
  animations: getAnimationData(animationKeyframes),
  events
}