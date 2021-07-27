import { IThreeScene, ThreeGroupChild } from "@types";
import { useEffect } from "react";
import * as THREE from "three";

const getSceneObjects = (immediateChildren: THREE.Object3D[]): THREE.Object3D[] => {
  const getInnerChildren = (parents: THREE.Object3D[]): THREE.Object3D[] => {
    const innerObjects: THREE.Object3D[][] = [];
    parents.forEach((child: THREE.Object3D): void => { // todo make recursive?
      if (child instanceof THREE.Group) {
        innerObjects.push(child.children);
      }
    });
    return innerObjects.flat();
  }
  return [
    ...immediateChildren,
    ...getInnerChildren(immediateChildren)
  ]
}

const useMouseEvent = (sceneComponents: IThreeScene, deps: string[] = []): void => {
  const { scene, camera, renderer } = sceneComponents;
  useEffect(() => {
    if (!(scene && camera && renderer)) return;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleEvent = (e: MouseEvent): void => {
      e.preventDefault();
      mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = - (e.clientY / renderer.domElement.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const objects = getSceneObjects(scene.children);
      const intersects = raycaster.intersectObjects(objects);
      const { canvas } = scene.userData;
      if (intersects.length > 0) {
        const { object } = intersects[0];
        object.userData.events?.[e.type]?.();
        if ((e.type === 'mousemove') && (object.userData.hoverCursor)) {
          if (canvas.style.cursor !== object.userData.hoverCursor) canvas.style.cursor = object.userData.hoverCursor;
        } else {
          canvas.style.cursor = '';
        }
      }
    }
    window.addEventListener('click', handleEvent);
    window.addEventListener('mousemove', handleEvent);
    return () => {
      window.removeEventListener('click', handleEvent);
      window.removeEventListener('mousemove', handleEvent);
    }
  }, [scene, camera, renderer, ...deps]);
}

export default useMouseEvent;