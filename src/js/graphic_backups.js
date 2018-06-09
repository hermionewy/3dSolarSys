// D3 is included by globally by default

const width = window.innerWidth,
    height = window.innerHeight;
let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 15000 );
scene.add(camera);
// let camera = new THREE.PerspectiveCamera(75, window.innerWidth/ window.innerHeight, 1, 11000);
let controls;
camera.target = new THREE.Vector3(0, 0, 0);
camera.lookAt(camera.target);

let textureLoader = new THREE.TextureLoader();
const AU = 27;

const sunSize = 348.15;
scene.add(new THREE.AmbientLight(0xffffff));

//renderer
let renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('solar-canvas').appendChild(renderer.domElement);//A canvas is automatically created by the renderer in the constructor.

// controls, camera
controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.target.set( 450, 0, 0 );
camera.position.set( 200, 18, 2000 );
controls.update();//must be called after any manual changes to the camera's transform


//stats
const stats = new Stats();
document.getElementById('solar-canvas').appendChild( stats.dom );
const gui = new dat.GUI();

const planetData =[
    {name: 'Mercury', size: 1.2, orbitRadius: sunSize + (AU * 0.4), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.8, rotateSpeed: 0.05, img:'./assets/model/mercury.jpeg'},
    {name: 'Venus', size: 3, orbitRadius: sunSize + (AU * 0.7), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.7, rotateSpeed: 0.05, img:'./assets/model/venus.jpeg'},
    {name: 'Earth', size: 3, orbitRadius: sunSize + AU, orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.6, rotateSpeed: 0.05, img:'./assets/model/earth.jpeg'},
    {name: 'Mars', size: 1.6, orbitRadius: sunSize + (AU * 1.5), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.48, rotateSpeed: 0.05, img:'./assets/model/mars.jpeg'},
    {name: 'Jupiter', size: 34.99, orbitRadius: sunSize + (AU * 5.2), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.22, rotateSpeed: 0.05, img:'./assets/model/jupiter.jpeg'},
    {name: 'Saturn', size: 29.1, orbitRadius: sunSize + (AU * 9.5), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.18, rotateSpeed: 0.05, img:'./assets/model/saturn.png'},
    {name: 'Uranus', size: 12.7, orbitRadius: sunSize + (AU * 19.2), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.13, rotateSpeed: 0.05, img:'./assets/model/uranus.jpeg'},
    {name: 'Neptune', size: 12.3, orbitRadius: sunSize + (AU * 30.1), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.1, rotateSpeed: 0.05, img:'./assets/model/neptune.jpeg'},
    {name: 'Sun', size: sunSize, orbitRadius: 0, orbitAngle: 0, orbitSpeed: 0.1, rotateSpeed: 0.05, img:'./assets/model/sun.jpg'},
];

const mercury = createStars(planetData[0].size, planetData[0].img);
const venus = createStars(planetData[1].size, planetData[1].img);
const earth =createStars(planetData[2].size, planetData[2].img);
const mars =createStars(planetData[3].size, planetData[3].img);
const jupiter =createStars(planetData[4].size, planetData[4].img);
const saturn =createStars(planetData[5].size, planetData[5].img);
const uranus =createStars(planetData[6].size, planetData[6].img);
const neptune =createStars(planetData[7].size, planetData[7].img);
const sun = createStars(planetData[8].size, planetData[8].img);

const eightPlanets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];

function createStars(size, img) {
    const material = new THREE.MeshLambertMaterial({
        map: textureLoader.load(img),
        flatShading: THREE.SmoothShading
    });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(size, 25, 25), material);
    scene.add(planet);
    return planet;
}


// saturn ring
const saturnSize = 29.1;
let saturnRingMaterial = new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('./assets/model/saturn-ring.jpg'),
    flatShading: THREE.SmoothShading,
    side: THREE.DoubleSide
});
const saturnRingStart = saturnSize + 3.3;
const saturnRingEnd = saturnSize + 60;
const saturnRing = new THREE.Mesh( new THREE.RingGeometry(saturnRingStart, saturnRingEnd, 30), saturnRingMaterial);
saturn.add(saturnRing);
saturnRing.rotation.x = 90 * Math.PI / 180;



let textMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
let mercuryText = new THREE.Mesh();
let venusText = new THREE.Mesh();
let marsText = new THREE.Mesh();
let earthText = new THREE.Mesh();
let jupiterText = new THREE.Mesh();
let saturnText = new THREE.Mesh();
let uranusText = new THREE.Mesh();
let neptuneText = new THREE.Mesh();



function createText(planetText, text, font) {
    const textGeometry = new THREE.TextGeometry(text, {
        font: font,
        size:7,
        bevelEnabled: false,
        height: 1
    });
    planetText = new THREE.Mesh(textGeometry, textMaterial);
    scene.add(planetText);
    return planetText
}

new THREE.FontLoader().load('./assets/model/helvetiker_regular.typeface.json', function(font) {
    mercuryText = createText(mercuryText, planetData[0].name, font);
    venusText = createText(venusText, planetData[1].name, font);
    earthText = createText(earthText, planetData[2].name, font);
    marsText = createText(marsText, planetData[3].name, font);
    saturnText = createText(saturnText, planetData[4].name, font);
    jupiterText = createText(jupiterText, planetData[5].name, font);
    uranusText = createText(uranusText, planetData[6].name, font);
    neptuneText = createText(neptuneText, planetData[7].name, font);
    //let allText=[mercuryText, venusText, earthText, marsText, saturnText, jupiterText, uranusText, neptuneText];
});

// let cameraZRotation = new THREE.Group(),
//     cameraYPosition = new THREE.Group(),
//     cameraZPosition = new THREE.Group(),
//     cameraXRotation = new THREE.Group(),
//     cameraYRotation = new THREE.Group(),
//     cameraXPosition = new THREE.Group();
//
// cameraZRotation.name = 'cameraZRotation';
// cameraYPosition.name = 'cameraYPosition';
// cameraZPosition.name = 'cameraZPosition';
// cameraXPosition.name = 'cameraXPosition';
// cameraXRotation.name = 'cameraXRotation';
// cameraYRotation.name = 'cameraYRotation';
//
// cameraZRotation.add(camera);
// cameraYPosition.add(cameraZRotation);
// cameraZPosition.add(cameraYPosition);
// cameraXRotation.add(cameraZPosition);
// cameraYRotation.add(cameraXRotation);
// cameraXPosition.add(cameraYRotation);
// scene.add(cameraXPosition);
//
// cameraXRotation.rotation.x = 0;
// cameraYPosition.position.y = 18;
// cameraZPosition.position.z = 2000;
//
// gui.add(cameraZPosition.position, 'z', -1000, 2500);
// gui.add(cameraYPosition.position, 'y', -1000, 2500);
// gui.add(cameraXPosition.position, 'x', -1000, 2500);
// gui.add(cameraYRotation.rotation, 'y', -Math.PI, Math.PI);
// gui.add(cameraXRotation.rotation, 'x', -Math.PI, Math.PI);
// gui.add(cameraZRotation.rotation, 'z', -Math.PI, Math.PI);

// new TWEEN.Tween({val: -Math.PI/2})
//     .to({val: 0}, 1000)
//     .easing(TWEEN.Easing.Quadratic.InOut)
//     .onUpdate(function() {
//         cameraXRotation.rotation.x = this.val;
//     })
//     .start();
let cameraRotation = new THREE.Group(),
    cameraPosition = new THREE.Group();

cameraRotation.add(camera);
cameraPosition.add(cameraRotation);
scene.add(cameraPosition);

cameraRotation.rotation.x = 0;
cameraPosition.position.y = 18;
cameraPosition.position.z = 2000;

gui.add(cameraPosition.position, 'z', -1000, 2500);
gui.add(cameraPosition.position, 'y', -1000, 2500);
gui.add(cameraPosition.position, 'x', -1000, 2500);
gui.add(cameraRotation.rotation, 'y', -Math.PI, Math.PI);
gui.add(cameraRotation.rotation, 'x', -Math.PI, Math.PI);
gui.add(cameraRotation.rotation, 'z', -Math.PI, Math.PI);





function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

const options = {
    color: 'black',
    background: 'white',
    corners: 'square'
};

animate();

function planetRotate(planet, text, id, centerPos) {
    if(!centerPos) centerPos=0;
    planetData[id].orbitAngle -= planetData[id].orbitSpeed;
    //let radians = planetData[id].orbitAngle * Math.PI / 180;
    let radians = 0 * Math.PI / 180;
    planet.position.x = Math.cos(radians) * planetData[id].orbitRadius;
    planet.position.z = Math.sin(radians) * planetData[id].orbitRadius;
    planet.rotation.y += planetData[id].rotateSpeed;
    text.position.x = planet.position.x + 15;
    text.position.y = planet.position.y + centerPos;
    text.position.z = planet.position.z;
    text.needsUpdate = true;
}

function animate() {
    planetRotate(mercury, mercuryText, 0, -25);
    planetRotate(venus, venusText, 1, -10);
    planetRotate(earth, earthText, 2, 5);
    planetRotate(mars, marsText, 3, 20);
    planetRotate(saturn, saturnText, 4, 30);
    planetRotate(jupiter, jupiterText, 5, 40);
    planetRotate(uranus, uranusText, 6, 10);
    planetRotate(neptune, neptuneText, 7, 10);
    sun.position.x = 0;
    sun.position.z = 0;
    sun.position.y = 0;
    stats.update();
    TWEEN.update();
    //The code below doesn't work. It cannot get right texts
    // eightPlanets.forEach(function (planet, id) {
    //     planetRotate(planet, allText[id], id);
    // })

    render();

    requestAnimationFrame(animate);
}

function render() {
    let r = Date.now() * 0.0005;

    renderer.render(scene, camera);
}

window.addEventListener('resize', resize, false);
document.addEventListener( 'wheel', onDocumentMouseWheel, false );

document.getElementById('btn1').addEventListener("click", (e)=>{
    new TWEEN.Tween({val: -Math.PI/2, val2: cameraRotation.rotation.y })
        .to({val: 0, val: 0}, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function() {
            cameraPosition.position.x = 0;
            cameraPosition.position.y = 0;
            cameraPosition.position.z = 0;
            cameraRotation.rotation.x = this.val;
            cameraRotation.rotation.y = this.val2;
        })
        .start();
});
document.getElementById('btn2').addEventListener("click", (e)=>{
    new TWEEN.Tween({val: 1000})
        .to({val: -1500}, 1000)
        .onUpdate(function() {
            cameraRotation.rotation.x = 0;
            cameraRotation.rotation.y = 0;
            cameraRotation.rotation.z = 0;
            cameraPosition.position.z = this.val;
        })
        .start();
});
document.getElementById('btn3').addEventListener("click", (e)=>{
    new TWEEN.Tween({val: 0, val2:0})
        .to({val: Math.PI/2, val2:0}, 1000)
        .delay(1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function() {
            cameraPosition.position.x = 0;
            cameraPosition.position.y = 0;
            cameraPosition.position.z = 0;
            cameraRotation.rotation.y = this.val;
            cameraRotation.rotation.x = this.val2;
        })
        .start();
});



function onDocumentMouseWheel( event ) {
    camera.fov += event.deltaY * 0.05;
    camera.updateProjectionMatrix();
}

function resize() {
    // effect.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); //Updates the camera projection matrix. Must be called after any change of parameters.

}
function init(){}

export default { init, resize };
