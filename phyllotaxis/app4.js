const scene = new THREE.Scene();
const PItoDeg = (Math.PI/180.0);
let exporting = false;
let gui;
let objects = [];
let group = new THREE.Group();
let n_frames = 0;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
const materials = new CollectionMaterials;
const geometries = new CollectionGeometries;

function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x160025);
  document.body.style.margin =0;
  document.body.appendChild(renderer.domElement);
  camera.position.z = 80;
  controls = new THREE.OrbitControls( camera, renderer.domElement );

  //lights
  let ambientLight = new THREE.AmbientLight( 0x000000 );
  scene.add( ambientLight );
  bloomEffect = new BloomEffect(scene, camera, window);
  gui = new Gui(exportMesh, regenerateMesh);
  gui.addScene(scene, ambientLight, renderer);
  gui.addMaterials(materials);
  gui.addBloom(bloomEffect.params, renderer, bloomEffect.bloomPass);
  gui.addAnimation();

  const light = new THREE.PointLight( 0xffffff, 1, 0 );
  light.position.set( 0, 200, 0 );
  scene.add( light);

  const axisHelper = new THREE.AxesHelper( 50 );
  scene.add( axisHelper );

  window.addEventListener('resize', function() {
      let WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();
  });

  //populateGroup(geometries[gui.params.geometry],materials[gui.params.material]);
  render();
  //animate();
};

function populateGroup(selected_geometry, selected_material) {
  for (let i = 0; i< gui.params.num; i++) {
      // make a meaningfull composition, experiment with other geometries like
      // https://threejs.org/docs/#api/geometries/IcosahedronGeometry
      //let coord = phyllotaxisConical(i, gui.params.angle, gui.params.spread, gui.params.extrude);
      //let coord =  phyllotaxisWrong(i, gui.params.angle, gui.params.spread, gui.params.num);
      let coord = phyllotaxisApple(i, gui.params.angle, gui.params.spread, gui.params.num)
      //let coord =  phyllotaxisSimple(i, gui.params.angle, gui.params.spread, gui.params.extrude);
      let object = new THREE.Mesh(selected_geometry, selected_material);
      object.position.set(coord.x, coord.y, coord.z);
      let angle_y = 130;
      object.rotateY( (angle_y + i * 100/gui.params.num ) * -PItoDeg );
      object.rotateZ( i* gui.params.angle * PItoDeg);

      objects.push(object);
      group.add(object);
  }
  scene.add(group);
}

function addStats(debug) {
  if (debug) {
      document.body.appendChild(stats.domElement);
  }
}


function resetGroup(){
  for (let index in objects) {
      let object = objects[index];
      group.remove( object );
  }
  scene.remove(group);
  objects = [];
}

function render(){
  n_frames +=0.0001;
  gui.params.spread = Math.abs(Math.sin(n_frames/gui.params.anim.freq) * gui.params.anim.amplitude);

  this.populateGroup(geometries[gui.params.geometry],materials[gui.params.material]);

  if(!exporting){
      if (gui.params.anim.zoetrope) {
        group.rotateZ( gui.params.anim.zoetrope_angle * PItoDeg);
      }
      bloomEffect.render();
  }
  resetGroup();
  requestAnimationFrame(render);

}

let exportMesh = () => {
  exporting = true;
  let selected_geometry = mergeObjectsInOneGeometry(objects);
  let mesh = new THREE.Mesh(selected_geometry, materials[gui.params.material]);
  scene.add(mesh);
  exportMeshAsObj(scene);
  scene.remove(mesh);
  exporting = false;
}

let regenerateMesh = () => {
  resetGroup();
  populateGroup(geometries[gui.params.geometry],materials[gui.params.material]);
}

function mergeObjectsInOneGeometry(objects){
  let geometry = new THREE.Geometry();
  for (let i = 0; i < objects.length; i++){
      let mesh = objects[i];
      mesh.updateMatrix();
      geometry.merge(mesh.geometry, mesh.matrix);
  }
  return geometry;
}


init();


/* Phyllotaxis algorithm */
function phyllotaxisSimple(i, angleInRadians, spread, extrude){
  let current_angle = i * angleInRadians;
  let radius = spread * Math.sqrt(i);
  let x = radius * Math.cos(current_angle);
  let y = radius * Math.sin(current_angle);
  let z = 0.0;
  if (extrude) {
      z = i * -.05;
  }
  return {x, y, z};
}

function phyllotaxisConical(i, angleInRadians, spread, extrude){
  let current_angle = i * angleInRadians;
  let radius = spread * Math.sqrt(i);
  let x = radius * Math.cos(current_angle);
  let y = radius * Math.sin(current_angle);
  let z = i * + extrude;
  return {x, y, z};
}

function phyllotaxisApple(i, angle, spread, tot){
  let inc = Math.PI / tot;
  let current_angle = i * inc;
  let current_angle_b= i * angle;
  let radius = spread * Math.sqrt(i);
  let x = radius * Math.sin(current_angle) * Math.cos(current_angle_b);
  let y = radius * Math.sin(current_angle) * Math.sin(current_angle_b);
  let z = radius * Math.cos(current_angle);
  return {x, y, z};
}

// this function is called Wrong because it is wrong! it was born as mistake
// while i was passing angles in degreees without converting them to radians.
// But sometimes there are strange patterns that generate a nice effect.
// To use it, pass the angles in degrees
function phyllotaxisWrong(i, angle, spread, tot){
  //let inc = Math.PI / tot;
  let inc = 180.0 / tot;
  let current_angle = i * inc;
  let current_angle_b= i * angle;
  let radius = spread * Math.sqrt(i);
  let x = radius * Math.sin(current_angle) * Math.cos(current_angle_b);
  let y = radius * Math.sin(current_angle) * Math.sin(current_angle_b);
  let z = radius * Math.cos(current_angle);
  return {x, y, z};
}