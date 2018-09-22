const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
const geometry = new THREE.Geometry();
const flowers = new THREE.Geometry();
const DEG_TO_RAD = Math.PI/180;
camera.translateY(200);
camera.lookAt(new THREE.Vector3(0,0,0));
//L-Systems variables
let angle = 35;
let axiom = "F";
let sentence = axiom;
let len = 10;
let limit = 5;
let decrease_percent = 0.65;

let rules = [];
rules[0] = {
  // a: "F",
  // b: "F[+F]F[-F]F"

  a: "F",
  b: "F[+F]F[-F][F]"

  // a: "F",
  // b: "FF+[+F-F-F]-[-F+F+F]"
}

let init = () => {
  // set the renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0cbcff, 1);
  document.body.style.margin =0;
  document.body.appendChild(renderer.domElement);
  camera.position.z = 80;
  controls = new THREE.OrbitControls( camera, renderer.domElement );

  // set a light
  let light = new THREE.PointLight( 0xffffff, 1, 0 );
  light.position.set( 100, 200, 0);
  scene.add( light);

  // draw axis, just to know where the x, y and z axis are
  let axisHelper = new THREE.AxesHelper( 50 );
  //scene.add( axisHelper );

  // when resizing the window, keep the proportions
  window.addEventListener('resize', function() {
      let WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();
  });

  // create a mesh and add it to the scene.
  let mesh = createTree();
  scene.add(mesh);

  render();
};

const createTree = () => {
  const branches = [];
  generate(rules, branches);
  //createBranchesFromSentence(sentence, branches);
  //console.log(sentence);
  console.log(branches.length);
  for (const b of branches) {
    addBranch(geometry,b.start.position,b.end.position);
    addFlower(b);
  }
  const line = new THREE.LineSegments( geometry, material );
  return line;
}

const addBranch = (geom,v1, v2) => {
  geom.vertices.push(new THREE.Vector3( v1.x, v1.y, v1.z) );
  geom.vertices.push(new THREE.Vector3( v2.x, v2.y, v2.z) );
}

const addFlower = (branch) => {

}

const generate = (rules,branches) => {
  for(let l = 0; l < limit; l++){
    //len *= 0.5;
    let nextSentence = "";

    for (var i = 0; i < sentence.length; i++) {
      let current = sentence.charAt(i);
      let found = false;
      for (let j = 0; j < rules.length; j++) {
        if (current == rules[j].a) {
          found = true;
          nextSentence += rules[j].b;
          break;
        }
      }
      if (!found) {
        nextSentence += current;
      }
    }

    sentence = nextSentence;
    let flower = l === (limit-1) ? true : false;
    //console.log(len);
    createBranchesFromSentence(sentence, branches, len, flower);

  }
  return sentence;
}

const createBranchesFromSentence = (sentence, branches, len, flower) => {
  let turtle = new THREE.Object3D();
  const bookmark = [];

  for (let i = 0; i < sentence.length; i++) {
    let current = sentence.charAt(i);

    let addBranch = false;
    if (current == "F") {
      addBranch = true;
    } else if (current == "+") {
      turtle.rotateZ(angle * DEG_TO_RAD);
    } else if (current == "-") {
      turtle.rotateZ(-angle * DEG_TO_RAD);
    } else if (current == "[") {
      bookmark.push(turtle.clone());
    } else if (current == "]") {
      turtle.copy(bookmark.pop(),false);
    }

    if (addBranch) {
      console.log(len);
      // TODO add random rotation on the y axis
      turtle.rotateY(Math.random()* Math.PI/6);
      let end = turtle.clone().translateY(len);
      //if (branchDoesNotExist(branches, turtle, end, len)) { // DOES NOT WORK
        let branch = { "start": turtle.clone(), "end": end, "len":len, "flower":flower };
        //console.log(branch);
        turtle.copy(end);
        branches.push(branch);
      //}
    }
  }
}

const branchDoesNotExist = (branches, turtle, end, len) => {
  for (b of branches){
    if(b.end.position.x === end.position.x &&
      b.end.position.y === end.position.y && 
      b.end.position.z === end.position.z && 

      b.start.position.x === turtle.position.x &&
      b.start.position.y === turtle.position.y &&
      b.start.position.z === turtle.position.z &&

      len === b.len
      ){
      return false;
    }
  }
  return true;

}

const render = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

init();

