import { IThreeScene } from "@types";
import { useEffect } from "react";
import * as THREE from "three";

const useWatchCursor = (model: any, sceneComponents: IThreeScene): void => {
  useEffect(() => {
    if (!model) return;
    const { scene, camera, renderer } = sceneComponents;
    if (!(scene && camera && renderer)) return;
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const pointOfIntersection = new THREE.Vector3();
    const handleMouseMove = (e: any) => {
      mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, pointOfIntersection);
      pointOfIntersection.z = camera.position.z;
      model.lookAt(pointOfIntersection);
    }
    window.addEventListener('mousemove', handleMouseMove, false);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [model]);
}

export default useWatchCursor;