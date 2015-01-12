var EarthApp = function() {
  Sim.App.call(this);
};

// subclass Sim.App
EarthApp.prototype = new Sim.App();

// custom Earth class
var Earth = function() {
  Sim.Object.call(this);
};

var Sun = function() {
  Sim.Object.call(this);
}

var Moon = function() {
  Sim.Object.call(this);
}

// custom initializer
EarthApp.prototype.init = function(param) {
  // call superclass init code to set up scene, renderer, default camera
  Sim.App.prototype.init.call(this, param);

  var earth = new Earth();
  earth.init();
  this.addObject(earth);

  var sun = new Sun();
  sun.init();
  this.addObject(sun);
};

Earth.prototype = new Sim.Object();
Earth.prototype.init = function() {
  // create a group to contain Earth and Clouds
  var earthGroup = new THREE.Object3D();
  this.setObject3D(earthGroup);

  this.createGlobe();
  this.createClouds();
  this.createMoon();
};

Earth.prototype.createGlobe = function() {
  var surfaceMap = THREE.ImageUtils.loadTexture('../images/earth_surface_2048.jpg');
  var normalMap = THREE.ImageUtils.loadTexture('../images/earth_normal_2048.jpg');
  var specularMap = THREE.ImageUtils.loadTexture('../images/earth_specular_2048.jpg');

  var shaderMaterial = new THREE.MeshPhongMaterial({
    map: surfaceMap,
    normalMap: normalMap,
    specularMap: specularMap
  });

  var globeGeometry = new THREE.SphereGeometry(1, 32, 32);

  // need these tangents for our shader
  globeGeometry.computeTangents();
  var globeMesh = new THREE.Mesh(globeGeometry, shaderMaterial);

  globeMesh.rotation.z = Earth.TILT;

  // add to our group
  this.object3D.add(globeMesh);

  // externalize this for render updates
  this.globeMesh = globeMesh;
};

Earth.prototype.createClouds = function() {
  var cloudsMap = THREE.ImageUtils.loadTexture('../images/earth_clouds_1024.png');
  var cloudsMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: cloudsMap,
    transparent: true
  });
  var cloudsGeometry = new THREE.SphereGeometry(Earth.CLOUDS_SCALE, 32, 32);
  var cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
  cloudsMesh.rotation.z = Earth.TILT;

  this.object3D.add(cloudsMesh);
  this.cloudsMesh = cloudsMesh;
};

Earth.prototype.createMoon = function() {
  var moon = new Moon();
  moon.init();
  this.addChild(moon);
};

Moon.prototype = new Sim.Object();
Moon.prototype.init = function() {
  var MOONMAP = '../images/moon_1024.jpg';
  var geometry = new THREE.SphereGeometry(Moon.SIZE_IN_EARTHS, 32, 32);
  var texture = THREE.ImageUtils.loadTexture(MOONMAP);
  var material = new THREE.MeshPhongMaterial({
    map: texture,
    ambient: 0x888888
  });
  var mesh = new THREE.Mesh(geometry, material);

  // get earth-sized units
  var distance = Moon.DISTANCE_FROM_EARTH / Earth.RADIUS;
  mesh.position.set(
    Math.sqrt(distance / 2),
    0,
    -Math.sqrt(distance / 2)
  );

  // show moon-face toward Earth
  mesh.rotation.y = Math.PI;

  // create a group to contain Earth and satellites
  var moonGroup = new THREE.Object3D();
  moonGroup.add(mesh);

  // tilt to ecliptic
  moonGroup.rotation.x = Moon.INCLINATION;

  this.setObject3D(moonGroup);
  this.moonMesh = mesh;
};

Moon.prototype.update = function() {
  // orbit
  this.object3D.rotation.y += (Earth.ROTATION_Y / Moon.PERIOD);
  Sim.Object.prototype.update.call(this);
};

Earth.prototype.update = function() {
  this.globeMesh.rotation.y += Earth.ROTATION_Y;
  this.cloudsMesh.rotation.y += Earth.CLOUDS_ROTATION_Y;

  Sim.Object.prototype.update.call(this);
};

Sun.prototype = new Sim.Object();
Sun.prototype.init = function() {
  // create light and position it back and to the left
  // relative to camera
  var light = new THREE.PointLight(0xffffff, 2, 100);
  light.position.set(-10, 0, 20);

  this.setObject3D(light);
};

// CONSTANTS

Earth.ROTATION_Y = 0.001;
Earth.TILT = 0.41;
Earth.CLOUDS_SCALE = 1.005;
Earth.CLOUDS_ROTATION_Y = Earth.ROTATION_Y * 0.95;
Earth.RADIUS = 6371;

Moon.DISTANCE_FROM_EARTH = 356400;
Moon.PERIOD = 28;
Moon.EXAGGERATE_FACTOR = 1.2;
Moon.INCLINATION = 0.089;
Moon.SIZE_IN_EARTHS = 1 / 3.7 * Moon.EXAGGERATE_FACTOR;

// INIT

window.onload = function() {
  var container = document.querySelector('#container');
  var app = new EarthApp();

  app.init({ container: container });
  app.run();
};
