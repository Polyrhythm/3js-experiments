var Saturn = function() {
  Sim.Object.call(this);
};

Saturn.prototype = new Sim.Object();

Saturn.prototype.init = function(params) {
  params = params || {};

  // create an orbit group to simulate the orbit - top-level
  var planetOrbitGroup = new THREE.Object3D();
  this.setObject3D(planetOrbitGroup);

  // group for Saturn + cloud meshes
  var planetGroup = new THREE.Object3D();
  var distance = params.distance || 0;
  var distSquared = distance * distance;
  planetGroup.position.set(
    Math.sqrt(distSquared / 2),
    0,
    -Math.sqrt(distSquared / 2)
  );

  planetOrbitGroup.add(planetGroup);

  this.planetGroup = planetGroup;
  var size = params.size || 1;
  this.planetGroup.scale.set(size, size, size);
  this.planetGroup.rotation.x = Saturn.TILT;

  this.createGlobe();
  this.createRings();
  this.animateOrbit = params.animateOrbit;
  this.period = params.period;
  this.revolutionSpeed = params.revolutionSpeed ?
    params.revolutionSpeed :
    Saturn.REVOLUTION_Y;
};

Saturn.prototype.createGlobe = function() {
  var SATURNMAP = '../images/saturn_bjoernjonsson.jpg';
  var geometry = new THREE.SphereGeometry(1, 32, 32);
  var texture = THREE.ImageUtils.loadTexture(SATURNMAP);
  var material = new THREE.MeshPhongMaterial({ map: texture });
  var globeMesh = new THREE.Mesh(geometry, material);

  this.planetGroup.add(globeMesh);
  this.globeMesh = globeMesh;
};
