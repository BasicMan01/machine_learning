import * as THREE from 'three';

import { GUI } from '../../../lib/threejs_140/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../lib/threejs_140/examples/jsm/controls/OrbitControls.js';

import SimpleLinearRegression from '../../../resources/js/SimpleLinearRegression.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		// x -> y
		this._data = [
			[2, 5],
			[3, 5],
			[1.5, 2.5],
			[8, 6.4],
			[9, 9],
			[7, 8.2],
			[4, 6.8],
			[6, 7],
			[5, 4],
			[1, 3]
		];

		this._linearRegression = new SimpleLinearRegression(this._data);
		this._dataPoints = [];

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': false,
			'sphereRadius': 0.1,
			'sphereWidthSegments': 12,
			'sphereHeightSegments': 8,
			'sphereMaterialColor': '#FFFF00'
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
		const material = new THREE.MeshBasicMaterial( { color: this._properties.sphereMaterialColor } );

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._gridHelper.visible = this._properties.gridHelperVisible;
		this._scene.add(this._gridHelper);

		const curve = new THREE.LineCurve(
			new THREE.Vector3(0, this._linearRegression.getInterceptY()),
			new THREE.Vector3(20, this._linearRegression.getY(20))
		);

		const line = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints(curve.getPoints(1)),
			new THREE.LineBasicMaterial( { color: 0xFF00FF } )
		);
		this._scene.add(line);

		for (let i = 0; i < this._data.length; ++i) {
			const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);

			mesh.position.x = this._data[i][0];
			mesh.position.y = this._data[i][1];

			this._dataPoints.push(mesh);
			this._scene.add(mesh);
		}

		this._createGeometry();
	}

	_createGeometry() {
		const geometry = new THREE.SphereGeometry(
			this._properties.sphereRadius,
			this._properties.sphereWidthSegments,
			this._properties.sphereHeightSegments
		);

		for (let i = 0; i < this._dataPoints.length; ++i) {
			this._dataPoints[i].geometry.dispose();
			this._dataPoints[i].geometry = geometry;
		}
	}

	_createGui() {
		const gui = new GUI({ width: 400 });

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderGeometry = gui.addFolder('Sphere Geometry');
		folderGeometry.add(this._properties, 'sphereRadius', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'sphereWidthSegments', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'sphereHeightSegments', 2, 64).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Sphere Material');
		folderMaterial.addColor(this._properties, 'sphereMaterialColor').onChange((value) => {
			const color = new THREE.Color(value);

			for (let i = 0; i < this._dataPoints.length; ++i) {
				this._dataPoints[i].material.color = color;
			}
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
}
