/* globals dat,rdo,THREE */

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
		'sphereRadius': 0.1,
		'sphereWidthSegments': 12,
		'sphereHeightSegments': 8,
		'sphereMaterialColor': '#FFFF00'
	};

	// x -> y
	let data = [
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

	

	let Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.linearRegression = new SimpleLinearRegression(data);
		this.dataPoints = [];
		this.line = null;
	};

	Main.prototype.init = function() {
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.position.set(0, 10, 20);

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
		let material = new THREE.MeshBasicMaterial( { color: properties.sphereMaterialColor } );

		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.gridHelper.visible = properties.gridHelperVisible;
		this.scene.add(this.gridHelper);

		let curve = new THREE.LineCurve(
			new THREE.Vector3(0, this.linearRegression.getInterceptY()),
			new THREE.Vector3(20, this.linearRegression.getY(20))
		);

		this.line = new THREE.Line(
			new THREE.Geometry().setFromPoints(curve.getPoints(1)),
			new THREE.LineBasicMaterial( { color: 0xFF00FF } )
		);
		this.scene.add(this.line);

		for (let i = 0; i < data.length; ++i) {
			let mesh = new THREE.Mesh(new THREE.Geometry(), material);

			mesh.position.x = data[i][0];
			mesh.position.y = data[i][1];

			this.dataPoints.push(mesh);
			this.scene.add(mesh);
		}

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		let geometry = new THREE.SphereGeometry(
			properties.sphereRadius,
			properties.sphereWidthSegments,
			properties.sphereHeightSegments
		);

		for (let i = 0; i < this.dataPoints.length; ++i) {
			this.dataPoints[i].geometry.dispose();
			this.dataPoints[i].geometry = geometry;
		}
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderGeometry = this.gui.addFolder('Sphere Geometry');
		folderGeometry.add(properties, 'sphereRadius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'sphereWidthSegments', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'sphereHeightSegments', 2, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});

		let folderMaterial = this.gui.addFolder('Sphere Material');
		folderMaterial.addColor(properties, 'sphereMaterialColor').onChange(function(value) {
			let color = new THREE.Color(value);

			for (let i = 0; i < self.dataPoints.length; ++i) {
				self.dataPoints[i].material.color = color;
			}
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