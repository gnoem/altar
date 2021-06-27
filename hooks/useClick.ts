import { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

const useClick = (callback: (obj: any) => void, deps: string[]): void => {
  const { renderer, camera } = useThree();
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleClick = (e: any) => {
      e.preventDefault();
      mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = - (e.clientY / renderer.domElement.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(objects); 
      if (intersects.length > 0) {
        callback(intersects[0].object);
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [...deps]);
}

export default useClick;