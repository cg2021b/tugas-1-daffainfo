let scene, canvas, camera, renderer, controls, cube;
let score = 0;
let currColor = "";
let currObj = {};
let currentObjects = 0;
let timeOut = 2000;

const bg_color = 0x68F3F8;
const numObjects = 50;
const intensity = 1;
const colors = [0x0000FF, 0xFF0000, 0xFFFF00, 0x1E8D69, 0x00FF00, 0x6600FF];
const width = 1366;
const height = 728;

const KEYCODE = {
	R: 82,
	I: 73
};

function randomColor() {
	const rand = Math.floor(Math.random() * colors.length);
	return colors[rand];
}

function rand(min, max) {
	return Math.random() * (max - min) + min;
}

function main() {	
	canvas = document.querySelector(".threejs");
	renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	renderer.setSize(width, height)

	camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000);
	camera.position.z = 5;

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(bg_color);
	scene.add(camera);

	controls = new THREE.OrbitControls( camera, canvas );
	controls.enableDamping = true;

	const onKeyDown = (e) => {
		if (e.keyCode === KEYCODE.R)
			window.location.reload();
		else if (e.keyCode === KEYCODE.I)
			alert("Permainan Sama Warna");
	};

	function setLight() {
		const light = new THREE.DirectionalLight(bg_color, intensity);
		light.position.set(3, 6, 4);
		const light2 = new THREE.DirectionalLight(bg_color, intensity);
		light2.position.set(-3, -6, -4);
		scene.add(light);
		scene.add(light2);
	}

	function drawCubes() {
		setTimeout(function () {
			const geometry = new THREE.BoxGeometry(5, 5, 5);
			const material = new THREE.MeshPhongMaterial({color: randomColor()});
			cube = new THREE.Mesh(geometry, material);
			scene.add(cube);
		
			cube.position.set(rand(-50, 50), rand(-20, 20), rand(-25, 25));	
			currentObjects++;

			timeOut -= currentObjects * 4;
			if (currentObjects <= numObjects) {
				drawCubes();
			}
		}, timeOut);
	}

	setLight();
	drawCubes();

	class PickHelper {
		constructor() {
			this.raycaster = new THREE.Raycaster();
			this.pickedObject = null;
			this.pickedObjectSavedColor = 0;
		}
		pick(normalizedPosition, scene, camera) {
			// restore the color if there is a picked object
			if (this.pickedObject) {
				this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
				this.pickedObject = undefined;
			}

			// cast a ray through the frustum
			this.raycaster.setFromCamera(normalizedPosition, camera);
			// get the list of objects the ray intersected
			const intersectedObjects = this.raycaster.intersectObjects(scene.children);
			if (intersectedObjects.length) {
				// pick the first object. It's the closest one
				this.pickedObject = intersectedObjects[0].object;

				// save its color
				this.pickedObjectSavedColor =this.pickedObject.material.emissive.getHex();

				let objColor = JSON.stringify(this.pickedObject.material.color);

				if ( prevPickPosition.x != pickPosition.x && prevPickPosition.y != pickPosition.y) {
					if (currColor == objColor && currObj !== this.pickedObject) {
						score += 4;
						document.getElementById("score").textContent = score;
						scene.remove(this.pickedObject);
						scene.remove(currObj);
						drawCubes();
						clearPickPosition();
						currentObjects -= 2;
					}
					// console.log(currColor);
					// console.log(objColor);
					prevPickPosition.x = pickPosition.x;
					prevPickPosition.y = pickPosition.y;
				} else {
					currColor = objColor;
					currObj = this.pickedObject;
				}
				this.pickedObject.material.emissive.setHex(0x3f3f3f);
			}
		}
	}

	const pickPosition = { x: 0, y: 0 };
	const prevPickPosition = { x: 0, y: 0 };
	const pickHelper = new PickHelper();
	clearPickPosition();

	function getCanvasRelativePosition(e) {
		const rect = canvas.getBoundingClientRect();
		return {
		x: ((e.clientX - rect.left) * width) / rect.width,
		y: ((e.clientY - rect.top) * height) / rect.height,
		};
	}

	function setPickPosition(e) {
		const pos = getCanvasRelativePosition(e);
		pickPosition.x = (pos.x / width) * 2 - 1;
		pickPosition.y = (pos.y / height) * -2 + 1; // note we flip Y
	}

	function clearPickPosition() {
		currColor = "";
		currObj = {};
		pickPosition.x = -100000;
		pickPosition.y = -100000;
	}

	window.addEventListener("click", setPickPosition);
	document.addEventListener("keydown", onKeyDown);
	window.addEventListener("mouseout", clearPickPosition);
	window.addEventListener("mouseleave", clearPickPosition);

	window.addEventListener("touchstart", (e) => {
		e.preventDefault();
		setPickPosition(e.touches[0]);
		},
		{ passive: false }
	);

	window.addEventListener("touchmove", (e) => {
		setPickPosition(e.touches[0]);
	});

	window.addEventListener("touchend", clearPickPosition);

	function render(time) {
		time *= 0.001;

		pickHelper.pick(pickPosition, scene, camera);
		controls.update();
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

main();