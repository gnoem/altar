import { IInteractionDef, IRawKeyframeMap } from "@types";
import * as THREE from "three";
import * as utils from "./_utils";

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

const startFrom = Object.keys(blueprint)[0];

const dialogue = (scene: THREE.Scene, next: () => void): {
  [state: string]: () => void
} => {
  const welcome = () => {
    const name = prompt(`
      hi, welcome to the altar\n
      its nice to have a visitors!\n
      please enter your name
    `);
    if (!name || ['no', 'nope', 'no thanks', 'no thank you'].includes(name)) {
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
      i'll be here in the water if you need me.\n
    `);
    next();
  }
  const welcomed = () => {
    scene.userData.unlock('lookaround');
  }
  return {
    welcome,
    welcomed
  }
}

const rawKeyframeData = (): IRawKeyframeMap => {
  const underwater = {
    rotation: [0, Math.PI, 0],
    position: [0, -6, 0]
  }
  const abovewater = {
    rotation: [0, 0, 0],
    position: [0, 0, 0]
  }
  const welcomed = {
    rotation: [0, Math.PI, 0],
    position: [0, -5, 0]
  }
  const help = {
    rotation: [-Math.PI / 4, 0, 0],
    position: [0, -3, 0]
  }
  return {
    underwater,
    abovewater,
    welcomed,
    help
  }
}

const animations = {
  rawKeyframeData,
  playAnimation: utils.animate(rawKeyframeData)
}

export {
  blueprint,
  startFrom,
  animations,
  dialogue
}