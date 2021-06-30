import { OrbitControls, RGBELoader, RoughnessMipmapper, Sky, Water } from "@lib";
import { IThreeScene } from "@types";
import { useEffect, useState } from "react";
import * as THREE from "three";

const useScene = (sceneRef: HTMLElement | null): IThreeScene => {
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.Camera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  useEffect(() => {
    if (!sceneRef || scene) return;
    const myScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    camera.position.set(0, 0, 10);
    dragToLookAround(camera, renderer);
    addLighting(myScene);
    const water = addWater(myScene);
    addEnvironmentTexture(myScene, camera, renderer);
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    setScene(myScene);
    setCamera(camera);
    setRenderer(renderer);
    sceneRef.appendChild(renderer.domElement);
    const animate = () => {
      requestAnimationFrame( animate );
      // @ts-ignore
      water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
      renderer.render(myScene, camera);
    }
    animate();
  }, [scene, sceneRef]);
  return {
    scene,
    camera,
    renderer
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