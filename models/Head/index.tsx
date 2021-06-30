import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from "@hooks";
import { ILoadedObject } from "@types";
import { loadObject } from "@utils";

const Head: React.FC<ILoadedObject> = ({ sceneComponents, setLoaded }) => {
  const [model, setModel] = useState<any>(null);
  const [clicked, setClicked] = useState<number | null>(null);
  const [state, setState] = useState<string>('underwater');
  const object = useGLTF('gltf/head.glb');
  useEffect(() => {
    if (!clicked) return;
    const getAnimationFrom: { [key: string]: string } = {
      'abovewater': 'underwater',
      'underwater': 'abovewater'
    }
    setState(prevState => getAnimationFrom[prevState] ?? 'abovewater');
    setClicked(null);
  }, [clicked]);
  useEffect(() => {
    if (!model) return;
    const rotationSpeed = Math.PI / 45;
    const translationSpeed = 0.1;
    const getAnimationFor = (state: string) => {
      switch (state) {
        case 'abovewater': return () => {
          if (model.rotation.y > 0) model.rotation.y -= rotationSpeed;
          if (model.position.y < 0) model.position.y += translationSpeed;
        }
        case 'underwater': return () => {
          if (model.rotation.y < Math.PI) model.rotation.y += rotationSpeed;
          if (model.position.y > -6) model.position.y -= translationSpeed;
        }
        default: return null;
      }
    }
    model.userData.tick = getAnimationFor(state);
  }, [state, model]);
  useEffect(() => {
    if (!object || model) return;
    object.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    object.rotation.y = Math.PI;
    object.position.y = -6;
    object.castShadow = true;
    object.name = 'head';
    object.userData = {
      tick: (delta: number) => {
        // starting animation
        /* const radiansPerSecond = THREE.MathUtils.degToRad(30);
        object.rotation.x += radiansPerSecond * delta; */
      },
      onClick: () => setClicked(Date.now())
    }
    loadObject(object, sceneComponents, null, setLoaded);
    setModel(object);
  }, [object, model]);
  return null;
}

export default Head;
