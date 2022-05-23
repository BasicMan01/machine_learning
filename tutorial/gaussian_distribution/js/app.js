import * as THREE from 'three';

import { GUI } from '../../../lib/threejs_140/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../lib/threejs_140/examples/jsm/controls/OrbitControls.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._baseLine = null;
		this._randomLine = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': false,
			'randomNumbers': 20000,
			'baseLinePoints': 50,
			'randomLinePoints': 50,
			'baseLineMaterialColor': '#FF00FF',
			'randomLineMaterialColor': '#FFFF00'
		};

		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 0, 20);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

		this._controls = new OrbitControls(this._camera, this._renderer.domElement);

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		this._init();
	}

	_init() {
		this._createGui();
		this._createObject();

		this._render();
	}

	_createObject() {
		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._gridHelper.visible = this._properties.gridHelperVisible;
		this._scene.add(this._gridHelper);

		this._baseLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.baseLineMaterialColor } )
		);
		this._scene.add(this._baseLine);

		this._randomLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.randomLineMaterialColor } )
		);
		this._scene.add(this._randomLine);


		this._createBaseLineGeometry();
		this._createRandomLineGeometry();
	}

	_createBaseLineGeometry() {
		const points = [];

		for (let i = -5; i <= 5; i += 0.1) {
			points.push(new THREE.Vector2(i * 1, this._gaussianDistribution(i,  0, 1) * 20));
		}

		const curve = new THREE.SplineCurve(points);

		this._baseLine.geometry.dispose();
		this._baseLine.geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(this._properties.baseLinePoints));
	}

	_createRandomLineGeometry() {
		const points = [];
		const sortable = [];
		const pointCounts = {};

		for (let i = 0; i < this._properties.randomNumbers; ++i) {
			const val = Math.round((this._gaussianRand()) * 10) / 10;

			if (!pointCounts.hasOwnProperty(val)) {
				pointCounts[val] = 0;
			}

			pointCounts[val] += 0.01;
		}

		for (const key in pointCounts) {
			if (pointCounts.hasOwnProperty(key)) {
				sortable.push([parseFloat(key), pointCounts[key]]);
			}
		}

		sortable.sort(function(a, b) {
			return a[0] - b[0];
		});

		for (let i = 0; i < sortable.length; ++i) {
			points.push(new THREE.Vector2(sortable[i][0], sortable[i][1]));
		}

		const curve = new THREE.SplineCurve(points);

		this._randomLine.geometry.dispose();
		this._randomLine.geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(this._properties.randomLinePoints));
	}

	_createGui() {
		const gui = new GUI({ width: 400 });

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Geometry');
		folderGeometry.add(this._properties, 'randomNumbers', 1000, 50000).step(1000).onChange((value) => {
			this._createRandomLineGeometry();
		});
		folderGeometry.add(this._properties, 'baseLinePoints', 10, 300).step(1).onChange((value) => {
			this._createBaseLineGeometry();
		});
		folderGeometry.add(this._properties, 'randomLinePoints', 10, 300).step(1).onChange((value) => {
			this._createRandomLineGeometry();
		});

		const folderMaterial = gui.addFolder('Material');
		folderMaterial.addColor(this._properties, 'baseLineMaterialColor').onChange((value) => {
			this._baseLine.material.color = new THREE.Color(value);
		});
		folderMaterial.addColor(this._properties, 'randomLineMaterialColor').onChange((value) => {
			this._randomLine.material.color = new THREE.Color(value);
		});

		gui.close();
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		this._renderer.render(this._scene, this._camera);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}

	// special functions
	_gaussianRand() {
		let u = 0;
		let v = 0;

		while (u === 0) {
			u = Math.random();
		}

		while (v === 0) {
			v = Math.random();
		}

		return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
	}

	_gaussianDistribution(x, mean, deviation) {
		const exp = Math.pow(x - mean, 2) / (2 * Math.pow(deviation, 2));
		const base = 1 / Math.sqrt(2 * Math.PI * Math.pow(deviation, 2));

		return base * Math.pow(Math.E, -exp);
	}

}
