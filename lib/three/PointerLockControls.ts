import * as THREE from "three";

const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _vector = new THREE.Vector3();

const _changeEvent = { type: 'change' }
const _lockEvent = { type: 'lock' }
const _unlockEvent = { type: 'unlock' }

const _PI_2 = Math.PI / 2;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

class PointerLockControls extends THREE.EventDispatcher {

	domElement: HTMLElement;
	mouseDown: boolean;
	isLocked: boolean;
	movementSpeed: number;
	minPolarAngle: number;
	maxPolarAngle: number;
	connect: () => void;
	disconnect: () => void;
	update: (delta: number) => void;
	dispose: () => void;
	getDirection: (v: THREE.Vector3) => THREE.Vector3;
	moveForward: (distance: number) => void;
	moveRight: (distance: number) => void;
	lock: () => void;
	unlock: () => void;

	constructor(camera: THREE.Camera, domElement: HTMLElement) {

		super();
		
		this.domElement = domElement;
		this.mouseDown = false;
		this.isLocked = false;

		this.movementSpeed = 1;

		// Set to constrain the pitch of the camera
		// Range is 0 to Math.PI radians
		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians

		const scope = this;

		const onKeyDown = (e: KeyboardEvent): void => {
			console.log(e.code);
			if (e.code === 'KeyW') {
				moveForward = true;
			}
		}

		const onMouseDown = (): void => {
			this.mouseDown = true;
			if (!scope.isLocked) {
				this.lock();
			}
		}

		const onMouseUp = (): void => {
			this.mouseDown = false;
		}

		const onMouseMove = (e: MouseEvent): void => {
			if (!scope.isLocked || !scope.mouseDown) return;

			const movementX = e.movementX || 0;
			const movementY = e.movementY || 0;

			const speed = 0.005;

			_euler.setFromQuaternion(camera.quaternion);
			_euler.y += movementX * speed;
			_euler.x += movementY * speed;
			_euler.x = Math.max(_PI_2 - scope.maxPolarAngle, Math.min(_PI_2 - scope.minPolarAngle, _euler.x));
			camera.quaternion.setFromEuler(_euler);
		}

		const onMouseWheel = (e: WheelEvent) => {
			const d = (e.deltaY < 0) ? 1 : -1;
			this.moveForward(d * this.movementSpeed);
		}

		const onPointerlockChange = (): void => {
			if (scope.domElement.ownerDocument.pointerLockElement !== scope.domElement) {
				scope.dispatchEvent(_unlockEvent);
				scope.isLocked = false;
				return;
			}
			scope.dispatchEvent(_lockEvent);
			scope.isLocked = true;
		}

		const onPointerlockError = (): void => {
			console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
		}

		this.connect = (): void => {
			scope.domElement.ownerDocument.addEventListener('keydown', onKeyDown);
			scope.domElement.ownerDocument.addEventListener('mousedown', onMouseDown);
			scope.domElement.ownerDocument.addEventListener('mouseup', onMouseUp);
			scope.domElement.ownerDocument.addEventListener('mousemove', onMouseMove);
			scope.domElement.ownerDocument.addEventListener('wheel', onMouseWheel);
			scope.domElement.ownerDocument.addEventListener('pointerlockchange', onPointerlockChange);
			scope.domElement.ownerDocument.addEventListener('pointerlockerror', onPointerlockError);
		}

		this.disconnect = (): void => {
			scope.domElement.ownerDocument.removeEventListener('keydown', onKeyDown);
			scope.domElement.ownerDocument.removeEventListener('mousedown', onMouseDown);
			scope.domElement.ownerDocument.removeEventListener('mouseup', onMouseUp);
			scope.domElement.ownerDocument.removeEventListener('mousemove', onMouseMove);
			scope.domElement.ownerDocument.removeEventListener('wheel', onMouseWheel);
			scope.domElement.ownerDocument.removeEventListener('pointerlockchange', onPointerlockChange);
			scope.domElement.ownerDocument.removeEventListener('pointerlockerror', onPointerlockError);
		}

		this.update = (delta: number) => {

			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;
			velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

			direction.z = Number(moveForward) - Number(moveBackward);
			direction.x = Number(moveRight) - Number(moveLeft);
			direction.normalize(); // this ensures consistent movements in all directions

			if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
			if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

			scope.moveRight(-velocity.x * delta);
			scope.moveForward(-velocity.z * delta);
		}

		this.dispose = this.disconnect;

		this.getDirection = (() => {
			const direction = new THREE.Vector3(0, 0, -1);
			return (v: THREE.Vector3): THREE.Vector3 => v.copy(direction).applyQuaternion(camera.quaternion);
		})();

		this.moveForward = (distance: number): void => {
			// move forward parallel to the xz-plane
			// assumes camera.up is y-up
			_vector.setFromMatrixColumn(camera.matrix, 0);
			_vector.crossVectors(camera.up, _vector);
			camera.position.addScaledVector(_vector, distance);
		}

		this.moveRight = (distance: number): void => {
			_vector.setFromMatrixColumn(camera.matrix, 0);
			camera.position.addScaledVector(_vector, distance);
		}

		this.lock = (): void => {
			this.isLocked = true;
			//this.domElement.requestPointerLock();
		}

		this.unlock = (): void => {
			this.isLocked = false;
			//scope.domElement.ownerDocument.exitPointerLock();
		}

		this.connect();

	}

}

export { PointerLockControls }