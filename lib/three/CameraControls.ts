import * as THREE from "three";
import { ISimpleObject, IStringObject } from "@types";
import { roundToDecimalPlaces } from "@utils";

const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _vector = new THREE.Vector3();

const _lockEvent = { type: 'lock' }
const _unlockEvent = { type: 'unlock' }

const _PI_2 = Math.PI / 2;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const move: ISimpleObject = {
	forward: false,
	backward: false,
	left: false,
	right: false,
	up: false,
	down: false
}

const keys: IStringObject = {
	'ArrowUp': 'forward',
	'KeyW': 'forward',
	'ArrowLeft': 'left',
	'KeyA': 'left',
	'ArrowDown': 'backward',
	'KeyS': 'backward',
	'ArrowRight': 'right',
	'KeyD': 'right',
}

type Boundary = [number | null, number | null] | null;

class CameraControls extends THREE.EventDispatcher {

	domElement: HTMLElement;
	mouseDown: boolean;
	isLocked: boolean;
	isEnabled: boolean;
	wheelToZoom: boolean;
	movementSpeed: number;
	boundaryX: Boundary;
	boundaryY: Boundary;
	boundaryZ: Boundary;
	minPolarAngle: number;
	maxPolarAngle: number;
	userData: ISimpleObject;
	connect: () => void;
	disconnect: () => void;
	update: (delta: number) => void;
	dispose: () => void;
	getDirection: (v: THREE.Vector3) => THREE.Vector3;
	moveForward: (distance: number) => void;
	moveRight: (distance: number) => void;
	moveUp: (distance: number) => void;
	lock: () => void;
	unlock: () => void;

	constructor(camera: THREE.Camera, domElement: HTMLElement) {

		super();
		
		this.domElement = domElement;
		this.mouseDown = false;
		this.isLocked = false;
		this.isEnabled = false;

		this.wheelToZoom = false;
		this.movementSpeed = 1;
		this.boundaryX = null;
		this.boundaryY = null;
		this.boundaryZ = null;

		// Set to constrain the pitch of the camera
		// Range is 0 to Math.PI radians
		this.minPolarAngle = 0; // radians - how far can we look downwards
		this.maxPolarAngle = Math.PI; // radians - how far can we look upwards

		this.userData = {
			tick: (delta: number) => this.update(delta)
		}

		const scope = this;

		const onKeyDown = (e: KeyboardEvent): void => {
			const direction = keys[e.code];
			if (!direction || move[direction] == null) return;
			move[direction] = true;
		}

		const onKeyUp = (e: KeyboardEvent): void => {
			const direction = keys[e.code];
			if (!direction || move[direction] == null) return;
			move[direction] = false;
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
			if (this.wheelToZoom) {
				this.moveForward(d * this.movementSpeed);
			} else {
				this.moveUp(d * this.movementSpeed * 0.5);
			}
		}

		const isMovementPermitted = (newPosition: THREE.Vector3) => {
			const boundariesObject: {
				[axis: string]: Boundary
			} = {
				x: this.boundaryX,
				y: this.boundaryY,
				z: this.boundaryZ
			}

			const isExceeded = (boundaryDef: [string, Boundary]) => {
				const [axis, boundary] = boundaryDef;
				if (boundary == null) return false;
				const [min, max] = boundary;
				// @ts-ignore
				const targetValue = roundToDecimalPlaces(newPosition[axis], 2);
				const exceedsMin = (min != null) && (targetValue < min);
				const exceedsMax = (max != null) && (targetValue > max);
				return (exceedsMin || exceedsMax);
			}

			const boundaries = Object.entries(boundariesObject);
			
			return !boundaries.some(isExceeded);
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
			console.error('CameraControls: Unable to use Pointer Lock API');
		}

		this.connect = (): void => {
			if (this.isEnabled) return;

			scope.domElement.ownerDocument.addEventListener('keydown', onKeyDown);
			scope.domElement.ownerDocument.addEventListener('keyup', onKeyUp);
			scope.domElement.ownerDocument.addEventListener('mousedown', onMouseDown);
			scope.domElement.ownerDocument.addEventListener('mouseup', onMouseUp);
			scope.domElement.ownerDocument.addEventListener('mousemove', onMouseMove);
			scope.domElement.ownerDocument.addEventListener('wheel', onMouseWheel);
			scope.domElement.ownerDocument.addEventListener('pointerlockchange', onPointerlockChange);
			scope.domElement.ownerDocument.addEventListener('pointerlockerror', onPointerlockError);

			this.isEnabled = true;
		}

		this.disconnect = (): void => {
			if (!this.isEnabled) return;

			scope.domElement.ownerDocument.removeEventListener('keydown', onKeyDown);
			scope.domElement.ownerDocument.removeEventListener('keyup', onKeyUp);
			scope.domElement.ownerDocument.removeEventListener('mousedown', onMouseDown);
			scope.domElement.ownerDocument.removeEventListener('mouseup', onMouseUp);
			scope.domElement.ownerDocument.removeEventListener('mousemove', onMouseMove);
			scope.domElement.ownerDocument.removeEventListener('wheel', onMouseWheel);
			scope.domElement.ownerDocument.removeEventListener('pointerlockchange', onPointerlockChange);
			scope.domElement.ownerDocument.removeEventListener('pointerlockerror', onPointerlockError);

			this.isEnabled = false;
		}

		this.update = (delta: number) => {

			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;
			velocity.y -= velocity.y * 100.0 * delta; // 100.0 = mass

			direction.x = Number(move.right) - Number(move.left);
			direction.z = Number(move.forward) - Number(move.backward);
			direction.y = Number(move.up) - Number(move.down);
			direction.normalize(); // this ensures consistent movements in all directions

			if (move.forward || move.backward) velocity.z -= direction.z * 400.0 * delta;
			if (move.up || move.down) velocity.y -= direction.y * 400.0 * delta;
			if (move.right || move.left) velocity.x -= direction.x * 400.0 * delta;

			scope.moveRight(-velocity.x * delta);
			scope.moveUp(-velocity.y * delta);
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
			const newPosition = camera.position.clone().addScaledVector(_vector, distance);
			if (isMovementPermitted(newPosition)) {
				camera.position.copy(newPosition);
			}
		}

		this.moveRight = (distance: number): void => {
			_vector.setFromMatrixColumn(camera.matrix, 0);
			const newPosition = camera.position.clone().addScaledVector(_vector, distance);
			if (isMovementPermitted(newPosition)) {
				camera.position.copy(newPosition);
			}
		}

		this.moveUp = (distance: number): void => {
			const vec = new THREE.Vector3(0, distance, 0);
			const newPosition = camera.position.clone().add(vec);
			if (isMovementPermitted(newPosition)) {
				camera.position.copy(newPosition);
			}
		}

		this.lock = (): void => {
			this.isLocked = true;
			//this.domElement.requestPointerLock();
		}

		this.unlock = (): void => {
			this.isLocked = false;
			//scope.domElement.ownerDocument.exitPointerLock();
		}

	}

}

export default CameraControls;