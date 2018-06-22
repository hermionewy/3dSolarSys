// D3 is included by globally by default
const width = window.innerWidth,
    height = window.innerHeight;
let scene = new THREE.Scene(), sceneAtmosphere= new THREE.Scene();
let camera = new THREE.OrthographicCamera( width / - 1, width / 1, height / 1, height / - 1, 1, 15000 );


var helper = new THREE.CameraHelper( camera );
scene.add( helper );
let controls;
const AU = 27, sunSize = 348.15;
let renderer = new THREE.WebGLRenderer();
const stats = new Stats(), gui = new dat.GUI();

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
var Shaders = {
    'earth' : {
        uniforms: {
            'texture': { type: 't', value: 0, texture: null }
        },
        vertexShader: [
            'varying vec3 vNormal;',
            'varying vec2 vUv;',
            'void main() {',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            'vNormal = normalize( normalMatrix * normal );',
            'vUv = uv;',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform sampler2D texture;',
            'varying vec3 vNormal;',
            'varying vec2 vUv;',
            'void main() {',
            'vec3 diffuse = texture2D( texture, vUv ).xyz;',
            'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
            'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
            'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
            '}'
        ].join('\n')
    },
    'atmosphere' : {
        uniforms: {},
        vertexShader: [
            'varying vec3 vNormal;',
            'void main() {',
            'vNormal = normalize( normalMatrix * normal );',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'varying vec3 vNormal;',
            'void main() {',
            'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
            'gl_FragColor = vec4( 0.996, 0.544, 0.092, 1.0 ) * intensity;',
            '}'
        ].join('\n')
    }
};
let textMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
let mercuryText = new THREE.Mesh();
let venusText = new THREE.Mesh();
let marsText = new THREE.Mesh();
let earthText = new THREE.Mesh();
let jupiterText = new THREE.Mesh();
let saturnText = new THREE.Mesh();
let uranusText = new THREE.Mesh();
let neptuneText = new THREE.Mesh();
const mercury = createStars(planetData[0].size, planetData[0].img);
const venus = createStars(planetData[1].size, planetData[1].img);
const earth =createStars(planetData[2].size, planetData[2].img);
const mars =createStars(planetData[3].size, planetData[3].img);
const jupiter =createStars(planetData[4].size, planetData[4].img);
const saturn =createStars(planetData[5].size, planetData[5].img);
const uranus =createStars(planetData[6].size, planetData[6].img);
const neptune =createStars(planetData[7].size, planetData[7].img);
const sun = createStars(planetData[8].size, planetData[8].img);
createGlow(sun.geometry);

let allText = [];

function init() {

    scene.add(camera);
    scene.add(new THREE.AmbientLight(0xffffff));

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('solar-canvas').appendChild(renderer.domElement);//A canvas is automatically created by the renderer in the constructor.

    // controls, camera
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set( 375, 0, 0 );
    camera.position.set( 375, 0, 2000 );
    // camera.position.set( 200, 18, 2000 );
    controls.update();//must be called after any manual changes to the camera's transform

    document.getElementById('solar-canvas').appendChild( stats.dom );

    //create saturn ring
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

    new THREE.FontLoader().load('./assets/model/helvetiker_regular.typeface.json', function(font) {
        mercuryText = createText(mercuryText, planetData[0].name, font);
        venusText = createText(venusText, planetData[1].name, font);
        earthText = createText(earthText, planetData[2].name, font);
        marsText = createText(marsText, planetData[3].name, font);
        saturnText = createText(saturnText, planetData[4].name, font);
        jupiterText = createText(jupiterText, planetData[5].name, font);
        uranusText = createText(uranusText, planetData[6].name, font);
        neptuneText = createText(neptuneText, planetData[7].name, font);
        allText=[mercuryText, venusText, earthText, marsText, saturnText, jupiterText, uranusText, neptuneText];
    });


    //helper
    gui.add(camera.position, 'x', -2000, 10000);
    gui.add(camera.position, 'y', -2000, 10000);
    gui.add(camera.position, 'z', -2000, 10000);
    gui.add(camera.rotation, 'x', -Math.PI/2, Math.PI/2);
    gui.add(camera.rotation, 'y', -Math.PI/2, Math.PI/2);
    gui.add(camera.rotation, 'z', -Math.PI/2, Math.PI/2);
}



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
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
function planetRotate(planet, text, id, centerPos) {
    if(!centerPos) centerPos=0;
    planetData[id].orbitAngle -= planetData[id].orbitSpeed;
    //let radians = planetData[id].orbitAngle * Math.PI / 180;
    let radians = 0 * Math.PI / 180;
    planet.position.x = Math.cos(radians) * planetData[id].orbitRadius;
    planet.position.z = Math.sin(radians) * planetData[id].orbitRadius;
    planet.position.y = 0;
    //planet.rotation.y += planetData[id].rotateSpeed;
    text.position.x = planet.position.x + 15;
    text.position.y = planet.position.y + centerPos;
    text.position.z = planet.position.z;
    text.needsUpdate = true;
}

function onDocumentMouseWheel( event ) {
    //camera.fov += event.deltaY * 0.05;
    camera.updateProjectionMatrix();
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); //Updates the camera projection matrix. Must be called after any change of parameters.
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function createStars(size, img) {
    let textureLoader = new THREE.TextureLoader();
    const material = new THREE.MeshLambertMaterial({
        map: textureLoader.load(img),
        flatShading: THREE.SmoothShading
    });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(size, 25, 25), material);
    scene.add(planet);
    return planet;
}

function createGlow() {
    const geometry = new THREE.SphereGeometry(sunSize, 50, 50);
    const shader = Shaders['atmosphere'];
    const uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    const material = new THREE.ShaderMaterial({

        uniforms: uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        // transparent: true
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set( 1.02, 1.02, 1.02 );
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    scene.add(mesh); // the blueish glow

}
// animate();
function animate() {
    planetRotate(mercury, mercuryText, 0, -25);
    planetRotate(venus, venusText, 1, -10);
    planetRotate(earth, earthText, 2, 5);
    planetRotate(mars, marsText, 3, 20);
    planetRotate(saturn, saturnText, 4, 30);
    planetRotate(jupiter, jupiterText, 5, 40);
    planetRotate(uranus, uranusText, 6, 10);
    planetRotate(neptune, neptuneText, 7, 10);
    camera.updateProjectionMatrix();
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
    camera.lookAt(earth.position);
    renderer.render(scene, camera);
}

function getCamera() {
    return camera
}


window.addEventListener('resize', resize, false);
document.addEventListener( 'wheel', onDocumentMouseWheel, false );


export default { init, resize, animate, getCamera};
