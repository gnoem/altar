import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { materials, interactions } from "@lib";
import { ILoadedObject } from "@types";
import { castModel, last, loadObject } from "@utils";
import { useInteraction } from "@hooks";

// animation w/ react-spring: https://codesandbox.io/embed/react-three-fiber-gestures-08d22?codemirror=1

const Torus: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  
  const interactionName = 'oracle';
  const interaction = interactions[interactionName];
  const { startFrom, animations } = interaction;
  const { state, next, interact } = useInteraction(model, interaction);
  
  useEffect(() => {
    const { scene, camera, renderer } = sceneComponents;
    if (!(scene && camera && renderer)) return;
    if (typeof state === 'string') return;
    if (last(state.steps) === 'welcome') {
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
    if (last(state.steps) === 'welcomed') {
      scene.userData.unlock('lookaround');
    }
  }, [state]);
  
  useEffect(() => {
    if (model) return;
    const geometry = new THREE.TorusGeometry(1, 0.5, 64, 64);
    const material = new THREE.ShaderMaterial(materials.gradient('hotpink', 'yellow'));
    const torus = new THREE.Mesh(geometry, material);
    const initial = animations.rawKeyframeData()[startFrom];
    castModel.position(torus, initial.position);
    castModel.rotation(torus, initial.rotation);
    torus.userData.hoverCursor = 'pointer';
    torus.userData.events = {
      click: interact
    }
    loadObject(torus, sceneComponents, null, setLoaded);
    setModel(torus);
  }, []);

  return null;
}

export default Torus;