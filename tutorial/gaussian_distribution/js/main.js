/* globals dat,THREE */

(function(window) {
	'use strict';

	let config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	let properties = {
		'axesHelperVisible': true,
		'gridHelperVisible': false,
		'randomNumbers': 20000,
		'baseLinePoints': 50,
		'randomLinePoints': 50,
		'baseLineMaterialColor': '#FF00FF',
		'randomLineMaterialColor': '#FFFF00'
	};

	function gaussianRand() {
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

	function gaussianDistribution(x, mean, deviation) {
		let exp = Math.pow(x - mean, 2) / (2 * Math.pow(deviation, 2));
		let base = 1 / Math.sqrt(2 * Math.PI * Math.pow(deviation, 2));

		return base * Math.pow(Math.E, -exp);
	}


	
	let Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;
		this.baseLine = null;
		this.randomLine = null;
	};

	Main.prototype.init = function() {
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.position.set(0, 0, 20);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());

		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

		this.gui = new dat.GUI({ width: 400 });
		this.gui.close();

		// add renderer to the DOM-Tree
		this.canvas.appendChild(this.renderer.domElement);

		window.addEventListener('resize', this.onResizeHandler.bind(this), false);

		this.createGui();
		this.createObject();

		this.render();
	};

	Main.prototype.createObject = function() {
		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.gridHelper.visible = properties.gridHelperVisible;
		this.scene.add(this.gridHelper);

		this.baseLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.baseLineMaterialColor } )
		);
		this.scene.add(this.baseLine);

		this.randomLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.randomLineMaterialColor } )
		);
		this.scene.add(this.randomLine);


		this.createBaseLineGeometry();
		this.createRandomLineGeometry();
	};

	Main.prototype.createBaseLineGeometry = function() {
		let points = [];

		for (let i = -5; i <= 5; i += 0.1) {
			points.push(new THREE.Vector2(i * 1, gaussianDistribution(i,  0, 1) * 20));
		}

		let curve = new THREE.SplineCurve(points);

		this.baseLine.geometry.dispose();
		this.baseLine.geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(properties.baseLinePoints));
	};

	Main.prototype.createRandomLineGeometry = function() {
		let points = [];
		let sortable = [];
		let pointCounts = {};

		for (let i = 0; i < properties.randomNumbers; ++i) {
			let val = Math.round((gaussianRand()) * 10) / 10;

			if (!pointCounts.hasOwnProperty(val)) {
				pointCounts[val] = 0;
			}

			pointCounts[val] += 0.01;
		}

		for (let key in pointCounts) {
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

		let curve = new THREE.SplineCurve(points);

		this.randomLine.geometry.dispose();
		this.randomLine.geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(properties.randomLinePoints));
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderGeometry = this.gui.addFolder('Geometry');
		folderGeometry.add(properties, 'randomNumbers', 1000, 50000).step(1000).onChange(function(value) {
			self.createRandomLineGeometry();
		});
		folderGeometry.add(properties, 'baseLinePoints', 10, 300).step(1).onChange(function(value) {
			self.createBaseLineGeometry();
		});
		folderGeometry.add(properties, 'randomLinePoints', 10, 300).step(1).onChange(function(value) {
			self.createRandomLineGeometry();
		});

		let folderMaterial = this.gui.addFolder('Material');
		folderMaterial.addColor(properties, 'baseLineMaterialColor').onChange(function(value) {
			self.baseLine.material.color = new THREE.Color(value);
		});
		folderMaterial.addColor(properties, 'randomLineMaterialColor').onChange(function(value) {
			self.randomLine.material.color = new THREE.Color(value);
		});
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));

		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.getCanvasHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getCanvasWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getCanvasWidth() / this.getCanvasHeight(); };

	Main.prototype.onResizeHandler = function(event) {
		this.camera.aspect = this.getCameraAspect();
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
	};



	let main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));