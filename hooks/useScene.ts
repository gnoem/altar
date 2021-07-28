import { useEffect, useState } from "react";
import * as THREE from "three";
import { Loop, DragControls, OrbitControls, RGBELoader, RoughnessMipmapper, objects } from "@lib";
import { IThreeScene } from "@types";
import { transformObject, mutateStateArray } from "@utils";

const { Water } = objects;

const useScene = (sceneRef: HTMLElement | null): IThreeScene => {
  const [isSet, setIsSet] = useState<boolean>(false);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.Camera | null>(null);
  const [loop, setLoop] = useState<Loop | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [newPower, setNewPower] = useState<string | null>(null);

  useEffect(() => {
    if (!sceneRef || isSet) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    const loop = new Loop(scene, camera, renderer);
    addLighting(scene);
    const water = addWater(scene);
    addEnvironmentTexture(scene, camera, renderer);
    scene.userData = {
      canvas: sceneRef,
      unlock: (power: string): void => {
        setNewPower(power);
      }
    }
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    const orbitControls = experimentalDrag(scene, camera, renderer);
    setScene(scene);
    setCamera(camera);
    setRenderer(renderer);
    setLoop(loop);
    sceneRef.appendChild(renderer.domElement);
    const animate = (): void => {
      requestAnimationFrame( animate );
      // @ts-ignore
      water.material.uniforms['time'].value += 1.0 / 60.0;
      orbitControls.update();
      loop.start();
    }
    animate();
    setIsSet(true);
  }, [isSet, sceneRef]);

  useEffect(() => {
    if (!(scene && camera && renderer && newPower)) return;
    if (unlocked.includes(newPower)) return;
    if (newPower === 'lookaround') {
      scene.userData.enableOrbitControls?.();
    }
    setUnlocked(mutateStateArray((array: string[]): number | null => {
      if (array.includes(newPower)) return null;
      return array.push(newPower);
    }));
    setNewPower(null);
  }, [scene, camera, renderer, newPower, unlocked]);

  useEffect(() => {
    if (!(scene && camera && renderer)) return;
    scene.userData.unlocked = unlocked;
  }, [unlocked.length]);

  return {
    scene,
    camera,
    renderer,
    loop
  }
}

const experimentalDrag = (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer): OrbitControls => {
  /* OrbitControls with zoom disabled + DragControls to allow moving the camera backwards and forward
  lets you click & drag your screen to look around, then use the wheel/trackpad to move around in the space instead of just zooming in/out
  
  bugs out when you translate the camera and then try to reset orbitControls.target (the point around which the camera orbits) to the camera's new position */

  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.target = new THREE.Vector3(0, 0, 5);
  orbitControls.enableZoom = false;
  orbitControls.minPolarAngle = Math.PI/2;
  orbitControls.maxPolarAngle = Math.PI/2; // how far you can look upwards - do not change or else camera might go in the water
  camera.position.copy(orbitControls.target);
  scene.userData.enableOrbitControls = (): void => {
    orbitControls.enabled = true;
  }

  const dragControls = new DragControls(camera, renderer, {
    orbitCenter: orbitControls.target
  });

  dragControls.enableRotation = false;
  dragControls.userData.resetTarget = (target: THREE.Vector3): void => {
    orbitControls.target.set(target.x, target.y, target.z);
    orbitControls.update();
  }
  return orbitControls;
}

const addLighting = (scene: THREE.Scene): void => {
  const ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
  const primaryLight = new THREE.DirectionalLight( 0xffffff, 1 );
  const secondaryLight = new THREE.DirectionalLight( 0xffffff, 0.1 );
  transformObject.position(primaryLight, [50, 0, 0]);
  transformObject.position(secondaryLight, [-50, 0, 0]);
  primaryLight.shadow.bias = 0.001;
  primaryLight.shadow.normalBias = 0.003;
  scene.add( primaryLight );
  scene.add( secondaryLight ); // preserves texture in shadowed areas
  scene.add( ambientLight );
}

const addEnvironmentTexture = (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer): void => {
  const pmremGenerator = new THREE.PMREMGenerator( renderer );
  pmremGenerator.compileEquirectangularShader();
  new RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .setPath('textures/')
    .load('pinksunset.hdr', (texture: THREE.Texture): void => {

      const envMap = pmremGenerator.fromEquirectangular( texture ).texture;

      scene.background = envMap;
      scene.environment = envMap;

      texture.dispose();
      pmremGenerator.dispose();

      renderer.render(scene, camera);

      // use of RoughnessMipmapper is optional
      const roughnessMipmapper = new RoughnessMipmapper(renderer);
      roughnessMipmapper.dispose();
    });
}

const addWater = (scene: THREE.Scene) => {
  const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

  const water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load( 'textures/waternormals.jpg', function ( texture ) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      } ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    }
  );
  water.position.y = -5;
  water.rotation.x = - Math.PI / 2;
  scene.add(water);
  return water;
}

export default useScene;