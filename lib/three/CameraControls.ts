import * as THREE from "three";
import { ISimpleObject, IStringObject } from "@types";
import { getSlope, roundToDecimalPlaces } from "@utils";

type Axis = 'x' | 'y';

type Direction = 1 | -1;

interface IMovement {
	axis: Axis;
	direction: Direction;
}

const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _vector = new THREE.Vector3();

const _lockEvent = { type: 'lock' }
const _unlockEvent = { type: 'unlock' }

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let previousTouch: Touch | null = null;
let eventCache: Touch[] = [];
let prevCache: (Touch | null)[] = [];
let prevDiff = {
	x: -1,
	y: -1
}

// for arrow key nav - mouse event nav (click or touch) should call this.moveRight, etc. directly
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

const touchedLog = (e: TouchEvent): boolean => {
	return !!(e.target as HTMLElement)?.closest?.('#log');
}

const log = (logResult: string, overwrite: boolean = false, stick: boolean = false): void => {
	const createDiv = (): HTMLDivElement => {
		const containerDiv = document.createElement('div');
		containerDiv.id = 'log';
		containerDiv.onmousedown = () => {
			containerDiv.classList.toggle('expanded');
		}
		const stickySpan = document.createElement('span');
		const innerDiv = document.createElement('div');
		const button = document.createElement('button');
		button.innerHTML = '×';
		button.onclick = () => {
			document.body.removeChild(containerDiv);
		}
		stickySpan.style.background = '#333'
		containerDiv.appendChild(stickySpan);
		containerDiv.appendChild(innerDiv);
		containerDiv.appendChild(button);
		document.body.appendChild(containerDiv);
		return innerDiv;
	}
	const span = document.querySelector('#log > span') ?? createDiv();
	const div = document.querySelector('#log > div') ?? createDiv();
	if (stick) {
		span.innerHTML = `> ${logResult}`;
	} else if (overwrite) {
		div.innerHTML = `> ${logResult}`;
	} else {
		div.innerHTML += `<br>> ${logResult}`;
	}
}

type Boundary = [number | null, number | null] | null;

class CameraControls extends THREE.EventDispatcher {

	domElement: HTMLElement;
	mouseDown: boolean;
	isPanning: boolean;
	isPinching: boolean;
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
	halt: () => void;
	update: (delta: number) => void;
	dispose: () => void;
	getDirection: (v: THREE.Vector3) => THREE.Vector3;
	moveForward: (distance: number) => void;
	moveRight: (distance: number) => void;
	moveUp: (distance: number) => void;

	constructor(camera: THREE.Camera, domElement: HTMLElement) {

		super();
		
		this.domElement = domElement;
		this.mouseDown = false;
		this.isEnabled = false;

		this.isPinching = false;
		this.isPanning = false;

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

		const rotateCamera = (movementX: number, movementY: number, speed: number): void => {
			_euler.setFromQuaternion(camera.quaternion);
			_euler.y += movementX * speed;
			_euler.x += movementY * speed;
			_euler.x = Math.max(Math.PI / 2 - scope.maxPolarAngle, Math.min(Math.PI / 2 - scope.minPolarAngle, _euler.x));
			camera.quaternion.setFromEuler(_euler);
		}

		// TOUCHSCREEN ONLY - 2-finger drag to move around x and y axis
		const translateAlongXY = ({ axis, direction }: IMovement): void => {
			if (this.isPinching) return;
			this.isPanning = true;
			if (axis === 'x') {
				this.moveRight(-direction * this.movementSpeed);
			} else {
				this.moveUp(-direction * this.movementSpeed);
			}
		}

		// TOUCHSCREEN ONLY - pinch to move around z axis
		const translateAlongZ = (touchA: Touch, touchB: Touch): void => {
			if (this.isPanning) return;
			// Calculate the distance between the two pointers
			const curDiff = {
				x: Math.abs(touchA.clientX - touchB.clientX),
				y: Math.abs(touchA.clientY - touchB.clientY)
			}

			// see whether X or Y difference is biggest and go with that
			const axis = (curDiff.x >= curDiff.y) ? 'x' : 'y';

			if (prevDiff[axis] > 0) {

				const differenceIsMeaningful = Math.abs(curDiff[axis] - prevDiff[axis]) > 1;
				if (!differenceIsMeaningful) {
					this.halt();
					return;
				}

				this.isPinching = true;

				if (curDiff[axis] > prevDiff[axis]) { // the distance between the two pointers has increased
					move.forward = true;
				}
				if (curDiff[axis] < prevDiff[axis]) { // the distance between the two pointers has decreased
					move.backward = true;
				}
			}

			// Cache the distance for the next move event
			prevDiff = {
				x: curDiff.x,
				y: curDiff.y
			}
		}

		const isMovementPermitted = (newPosition: THREE.Vector3): boolean => {

			const isNull = (x: any): boolean => x == null;
			if (
				(this.boundaryX?.every(isNull)) &&
				(this.boundaryY?.every(isNull)) &&
				(this.boundaryZ?.every(isNull))
			) return true;

			const boundariesObject: {
				[axis: string]: Boundary
			} = {
				x: this.boundaryX,
				y: this.boundaryY,
				z: this.boundaryZ
			}

			const isExceeded = (boundaryDef: [string, Boundary]): boolean => {
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
			const isPermitted = !boundaries.some(isExceeded);
			if (!isPermitted) {
				this.halt();
			}
			return isPermitted;
		}

		const cacheTouchEvent = (e: TouchEvent) => {
			// upsert touch events into cache
			for (let i = 0; i < e.touches.length; i++) {
				const thisTouch = e.touches[i];
				// find this touch's index in event cache
				const index = eventCache.findIndex(event => event.identifier === thisTouch.identifier);
				if (index !== -1) {
					// update prevCache
					prevCache[index] = eventCache[index];
					// update event in cache
					eventCache[index] = thisTouch;
				} else {
					// add event to cache
					const newIndex = eventCache.push(thisTouch) - 1; // .push returns new array length
					prevCache[newIndex] = thisTouch;
				}
			}
		}

		const getTouchMovement = (index: number, strict: boolean = false): IMovement | null => {
			const touch = eventCache[index];
			const prevTouch = prevCache[index];
			if (!prevTouch) return null;
			const { clientX, clientY } = touch;
			const { clientX: prevX, clientY: prevY } = prevTouch;
			// remember to make y values negative for slope calculation because clientY value increases downwards, not upwards
			const slope = getSlope(clientX, -clientY, prevX, -prevY);
			const getAxis = (): Axis | null => {
				const limit = strict ? 5 : 1; // 5 is kind of arbitrary but whatever
				if (Math.abs(slope) >= limit) return 'y';
				if (Math.abs(slope) < 1) return 'x';
				else return null;
			}
			const axis = getAxis();
			const getDirection = (): Direction | null => {
				// assuming axis is not null
				if (axis === 'x') {
					const diffX = clientX - prevX;
					if (diffX === 0) return null;
					return (diffX > 0) ? 1 : -1;
				}
				if (axis === 'y') {
					const diffY = prevY - clientY; // flipped because clientY value increases downwards
					if (diffY === 0) return null;
					return (diffY > 0) ? 1 : -1;
				}
				return null;
				// return 1 or -1
			}
			const direction = getDirection();
			if (!axis || !direction) return null;
			return {
				axis,
				direction
			}
		}

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
		}

		const onMouseUp = (): void => {
			this.mouseDown = false;
		}

		const onMouseMove = (e: MouseEvent): void => {
			if (!scope.mouseDown) return;

			const movementX = e.movementX || 0;
			const movementY = e.movementY || 0;
			const speed = 0.005;

			rotateCamera(movementX, movementY, speed);
		}

		const onMouseWheel = (e: WheelEvent): void => {
			const d = (e.deltaY < 0) ? 1 : -1;
			if (this.wheelToZoom) {
				this.moveForward(d * this.movementSpeed);
			} else {
				this.moveUp(d * this.movementSpeed * 0.5);
			}
		}

		// TOUCHSCREEN - drag and pinch
		const onTouchMove = (e: TouchEvent): void => {
			if (touchedLog(e)) return;

			// two-finger gestures, either pinch or drag
			if (e.touches.length > 1) {
				cacheTouchEvent(e);

				// If two pointers are down, check for pinch and drag/pan gestures
				if (eventCache.length == 2) {
					const touchA = eventCache[0];
					const touchB = eventCache[1];
					
					/* check if two pointers are travelling in roughly the same direction,
					which will tell us whether or not the user is pinching or dragging */
					const movementA = getTouchMovement(0);
					const movementB = getTouchMovement(1);

					const roughlySameDirection = (): boolean => {
						if (!(movementA?.axis && movementA?.direction)) return false;
						if (!(movementB?.axis && movementB?.direction)) return false;
						if (!(movementA?.axis === movementB?.axis)) return false;
						if (!(movementA?.direction === movementB?.direction)) return false;
						return true;
					}

					if (roughlySameDirection()) {
						// translate along X and Y axes
						translateAlongXY(movementA!);
					} else {
						// else translate along Z
						translateAlongZ(touchA, touchB);
					}
				}

				return;
			}

			// 1-finger drag
			const touch = e.touches[0];

			if (previousTouch) {
				const movementX = touch.pageX - previousTouch.pageX;
				const movementY = touch.pageY - previousTouch.pageY;
				const speed = 0.005;
				rotateCamera(movementX, movementY, speed);
			}

			previousTouch = touch;

		}

		const onTouchStart = (e: TouchEvent): void => {
			if (touchedLog(e)) return;
			cacheTouchEvent(e);
			if ((e.touches.length > 1) || (eventCache.length > 0)) {
        e.preventDefault();
      }
		}

		const onTouchEnd = (e: TouchEvent): void => {
			if (touchedLog(e)) return;

			this.halt();
			this.isPinching = false;
			this.isPanning = false;
			previousTouch = null;
			
			// Remove this event from eventCache
			for (let i = 0; i < e.changedTouches.length; i++) {
				const thisTouch = e.changedTouches[i];
				// find this touch's index in eventCache
				const index = eventCache.findIndex(event => event.identifier === thisTouch.identifier);
				if (index !== -1) {
					prevCache[index] = null;
					// remove event from cache
					eventCache.splice(index, 1);
				}
			}

			// If the number of pointers down is less than two then reset diff tracker
			if (eventCache.length < 2) {
				prevDiff = {
					x: -1,
					y: -1
				}
			}
		}

		const onPointerlockChange = (): void => {
			if (scope.domElement.ownerDocument.pointerLockElement !== scope.domElement) {
				scope.dispatchEvent(_unlockEvent);
				//scope.isLocked = false;
				return;
			}
			scope.dispatchEvent(_lockEvent);
			//scope.isLocked = true;
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
			
			scope.domElement.ownerDocument.addEventListener('touchmove', onTouchMove);
			scope.domElement.ownerDocument.addEventListener('touchstart', onTouchStart, { passive: false });
			scope.domElement.ownerDocument.addEventListener('touchend', onTouchEnd);

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

			scope.domElement.ownerDocument.removeEventListener('touchmove', onTouchMove);
			scope.domElement.ownerDocument.removeEventListener('touchstart', onTouchStart);
			scope.domElement.ownerDocument.removeEventListener('touchend', onTouchEnd);

			scope.domElement.ownerDocument.removeEventListener('pointerlockchange', onPointerlockChange);
			scope.domElement.ownerDocument.removeEventListener('pointerlockerror', onPointerlockError);

			this.isEnabled = false;
		}

		this.halt = (): void => {
			for (const direction in move) {
				move[direction] = false;
			}
		}

		this.update = (delta: number) => {

			if (Object.values(move).every(dir => dir === false)) return;

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

	}

}

export default CameraControls;