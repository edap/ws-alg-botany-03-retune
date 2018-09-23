const DEG_TO_RAD = Math.PI/180;

//THREE js variables
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1500);
const renderer = new THREE.WebGLRenderer({antialias:true});
camera.translateY(200);
camera.lookAt(new THREE.Vector3(0,0,0));

// Trunk variables
const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
const geometry = new THREE.Geometry();

// Flowers variables
const flowers = new THREE.Geometry();
let flowerGeometry = new THREE.SphereGeometry(1, 32, 32 );
const flowerMaterial = new THREE.MeshBasicMaterial({color:0xFF0000});

// Leafs variable
const createLeafGeometry = () => {
  const points = [];
  for ( var i = 0; i < 10; i ++ ) {
    points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 10 + 5, ( i - 5 ) * 2 ) );
  }
  
  const geom = new THREE.LatheGeometry( points, 5, 0, 0.2 );
  geom.computeBoundingBox();
  const bb = geom.boundingBox;
  const z = bb.max.z - bb.min.z;
  const y = bb.max.y - bb.min.y;
  const x = bb.max.x - bb.min.x;
  geom.applyMatrix( new THREE.Matrix4().makeTranslation(0, y/2.0, -z/2.) );
  return geom;
}
const leafGeometry = createLeafGeometry();
const leafMaterial = new THREE.MeshPhongMaterial({color:0x00FF00, side: THREE.DoubleSide});

//L-Systems rules variables
let angle = 35;
let axiom = "F";
let sentence = axiom;
let len = 10;
let limit = 5;
let rules = [];
rules[0] = {
  // TRY new rules
  // a: "F",
  // b: "F[+F]F[-F]F"

  // a: "F",
  // b: "F[+F]F[-F][F]"

  a: "F",
  b: "FF+[+F-F-F]-[-F+F+F]"
}

// Let's go!
let init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0cbcff, 1);
  document.body.style.margin =0;
  document.body.appendChild(renderer.domElement);
  camera.position.z = 80;
  controls = new THREE.OrbitControls( camera, renderer.domElement );

  let light = new THREE.PointLight( 0xffffff, 1, 0 );
  light.position.set( 100, 200, 0);
  scene.add( light);

  let axisHelper = new THREE.AxesHelper( 50 );
  scene.add( axisHelper );

  window.addEventListener('resize', function() {
      let WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();
  });

  let mesh = createTree();
  scene.add(mesh);

  render();
};

const createTree = () => {
  const branches = [];
  const sentence = generate(rules);
  createBranchesFromSentence(sentence, branches, len);
  
  for (const b of branches) {
    addBranch(geometry, b.start.position, b.end.position);

    // TRY Add organs
    // if(Math.random() > 0.5){
    //   addFlower(b);
    // }else{
    //   addLeaf(b);
    // }
  }
  const line = new THREE.LineSegments( geometry, material );
  return line;
}

const addBranch = (geom,v1, v2) => {
  geom.vertices.push(new THREE.Vector3( v1.x, v1.y, v1.z) );
  geom.vertices.push(new THREE.Vector3( v2.x, v2.y, v2.z) );
}

const addFlower = (branch) => {
  // TODO merge into one geometry
  let mesh = new THREE.Mesh(flowerGeometry, flowerMaterial);
  mesh.position.set(branch.end.position.x, branch.end.position.y, branch.end.position.z);
  scene.add(mesh);
}

const addLeaf = (branch) => {
  //TODO merge into one geometry
  let mesh = new THREE.Mesh(leafGeometry, leafMaterial);
  
  let branchQuat = new THREE.Quaternion();
  branch.end.getWorldQuaternion(branchQuat);
  mesh.setRotationFromQuaternion(branchQuat);

  mesh.position.set(branch.end.position.x, branch.end.position.y, branch.end.position.z);
  
  scene.add(mesh);
}

const generate = (rules) => {
  for(let l = 0; l < limit; l++){
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
  }
  return sentence;
}

const createBranchesFromSentence = (sentence, branches, len) => {
  let turtle = new THREE.Object3D();
  turtle.position.set(0,-200,0);
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
      // TRY add random rotation on the y axis
      // turtle.rotateY(Math.random()* Math.PI/6);
      let end = turtle.clone().translateY(len);
      let branch = { "start": turtle.clone(), "end": end};
      turtle.copy(end);
      branches.push(branch);
    }
  }
}

const render = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

init();

