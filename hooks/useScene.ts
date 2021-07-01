import { useEffect, useState } from "react";
import * as THREE from "three";
import { Loop, OrbitControls, RGBELoader, RoughnessMipmapper, objects } from "@lib";
import { IThreeScene } from "@types";
import { mutateStateArray } from "@utils";

const { Water, Sky } = objects;

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
    const loop = new Loop(scene, camera, renderer);
    camera.position.set(0, 0, 10);
    addLighting(scene);
    const water = addWater(scene);
    addEnvironmentTexture(scene, camera, renderer);
    scene.userData = {
      canvas: sceneRef,
      unlock: (power: string) => {
        setNewPower(power);
      }
    }
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    setScene(scene);
    setCamera(camera);
    setRenderer(renderer);
    setLoop(loop);
    sceneRef.appendChild(renderer.domElement);
    const animate = () => {
      requestAnimationFrame( animate );
      // @ts-ignore
      water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
      loop.start();
    }
    animate();
    setIsSet(true);
  }, [isSet, sceneRef]);

  useEffect(() => {
    if (!(scene && camera && renderer && newPower)) return;
    if (unlocked.includes(newPower)) return;
    if (newPower === 'lookaround') {
      dragToLookAround(camera, renderer);
    }
    setUnlocked(mutateStateArray((array: string[]) => {
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

const dragToLookAround = (camera: THREE.Camera, renderer: THREE.WebGLRenderer): void => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = Math.PI/2;
  controls.maxPolarAngle = Math.PI/2;
  controls.minDistance = 5;
  controls.maxDistance = 50;
  // controls.update() must be called after any manual changes to the camera's transform
  controls.update();
}

const addLighting = (scene: THREE.Scene): void => {
  const ambientLight = new THREE.AmbientLight( 0x777777 );
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  directionalLight.position.x = 2;
  directionalLight.position.z = 2;
  directionalLight.shadow.bias = 0.001;
  directionalLight.shadow.normalBias = 0.003;
  scene.add( directionalLight ); // needed for shadows!!
  scene.add( ambientLight );
}

const addEnvironmentTexture = (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => {
  const pmremGenerator = new THREE.PMREMGenerator( renderer );
  pmremGenerator.compileEquirectangularShader();
  new RGBELoader()
    .setDataType( THREE.UnsignedByteType )
    .setPath( 'textures/' )
    .load( 'pinksunset.hdr', function ( texture: any ) {

      const envMap = pmremGenerator.fromEquirectangular( texture ).texture;

      scene.background = envMap;
      scene.environment = envMap;

      texture.dispose();
      pmremGenerator.dispose();

      renderer.render(scene, camera);

      // use of RoughnessMipmapper is optional
      const roughnessMipmapper = new RoughnessMipmapper( renderer );
      roughnessMipmapper.dispose();

    } );
}

const addSky = (scene: THREE.Scene, renderer: THREE.WebGLRenderer, water: any) => {
  let sun = new THREE.Vector3();
  const sky = new Sky();
  sky.scale.setScalar( 10000 );
  scene.add( sky );
  // @ts-ignore
  const skyUniforms = sky.material.uniforms;
  skyUniforms[ 'turbidity' ].value = 10;
  skyUniforms[ 'rayleigh' ].value = 2;
  skyUniforms[ 'mieCoefficient' ].value = 0.005;
  skyUniforms[ 'mieDirectionalG' ].value = 0.8;
  const parameters = {
    elevation: 2,
    azimuth: 180
  }
  const pmremGenerator = new THREE.PMREMGenerator( renderer );
  const updateSun = () => {
    const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
    const theta = THREE.MathUtils.degToRad( parameters.azimuth );
    sun.setFromSphericalCoords( 1, phi, theta );
    // @ts-ignore
    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();
    // @ts-ignore
    scene.environment = pmremGenerator.fromScene( sky ).texture;
  }
  updateSun();
}

const addNightSky = (scene: THREE.Scene) => {
  const material = new THREE.MeshBasicMaterial();
  const loader = new THREE.TextureLoader();
  loader.load('textures/night.jpg', (texture) => {
    material.map = texture;
    material.needsUpdate = true;
  });
  const geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 32);
  const sky = new THREE.Mesh(geometry, material);
  sky.position.z = -500;
  scene.add(sky);
  return sky;
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