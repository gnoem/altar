import { useEffect, useState } from "react";
import * as THREE from "three";
import { Loop, DragControls, OrbitControls, RGBELoader, RoughnessMipmapper, objects, PointerLockControls } from "@lib";
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
    addWater(scene, loop);
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
    pointerLockDrag(scene, camera, renderer, loop);
    setScene(scene);
    setCamera(camera);
    setRenderer(renderer);
    setLoop(loop);
    loop.start();
    sceneRef.appendChild(renderer.domElement);
    setIsSet(true);
  }, [isSet, sceneRef]);

  useEffect(() => {
    if (!(scene && camera && renderer && newPower)) return;
    if (unlocked.includes(newPower)) return;
    if (newPower === 'lookaround') {
      scene.userData.enableDragControls?.();
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

const pointerLockDrag = (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, loop: Loop): PointerLockControls => {
  const controls = new PointerLockControls(camera, renderer.domElement);
  controls.boundaryX = [-150, 150];
  controls.boundaryY = [0, 15];
  controls.boundaryZ = [-150, 150];
  controls.connect();
  scene.userData.enableDragControls = (enableControls: boolean = true): void => {
    if (enableControls) controls.connect();
    else controls.dispose();
  }
  loop.add(controls);
  return controls;
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

const addWater = (scene: THREE.Scene, loop: Loop) => {
  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
  const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', (texture: THREE.Texture): void => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
  });
  water.position.y = -5;
  water.rotation.x = -Math.PI / 2;
  water.userData.tick = (): void => {
    const waterMaterial = water.material;
    (waterMaterial as THREE.ShaderMaterial).uniforms['time'].value += 1.0 / 60.0;
  }
  loop.add(water);
  scene.add(water);
  return water;
}

export default useScene;