import { IThreeScene } from "@types";
import { useEffect } from "react";
import * as THREE from "three";

const useClick = (sceneComponents: IThreeScene, /* callback: (obj: any) => void, */ deps: string[] = []): void => {
  const { scene, camera, renderer } = sceneComponents;
  useEffect(() => {
    if (!(scene && camera && renderer)) return;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleEvent = (e: any) => {
      e.preventDefault();
      mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = - (e.clientY / renderer.domElement.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const getSceneObjects = (immediateChildren: any[]) => {
        const getInnerChildren = (object: any) => {
          const innerObjects: any[] = [];
          object.forEach((child: any) => { // todo make recursive?
            if (child instanceof THREE.Group) {
              child.children.forEach((innerChild: any) => {
                innerChild.userData = child.userData;
              });
              innerObjects.push(child.children);
            }
          });
          return innerObjects;
        }
        return [
          ...immediateChildren,
          ...getInnerChildren(immediateChildren).flat()
        ]
      }
      const objects = getSceneObjects(scene.children);
      const intersects = raycaster.intersectObjects(objects);
      if (intersects.length > 0) {
        intersects[0].object.userData.onClick?.();
      }
    }
    window.addEventListener('click', handleEvent);
    return () => {
      window.removeEventListener('click', handleEvent);
    }
  }, [scene, camera, renderer, ...deps]);
}

export default useClick;