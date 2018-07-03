// D3 is included by globally by default
var Graphic = function(){
    const width = window.innerWidth,
        height = window.innerHeight;
    let scene = new THREE.Scene(), sceneAtmosphere= new THREE.Scene();
    let camera = new THREE.OrthographicCamera( width / - 1, width / 1, height / 1, height / - 1, 0.01, 15000 );
    const self=this;

    // var helper = new THREE.CameraHelper( camera );
    // scene.add( helper );
    let controls, raycaster, mouse= { x: 0, y: 0 }, intersects, INTERSECTED;
    const AU = 27, sunSize = 348.15;
    let renderer = new THREE.WebGLRenderer();
    //const stats = new Stats(), gui = new dat.GUI();
    const category = [ 'Population', 'GDP', 'Literacy'];

    const planetData =[
        {name: 'Mercury', size: 1.2, orbitRadius: sunSize + (AU * 0.4), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.8, rotateSpeed: 0.05, img:'./assets/model/mercury.jpeg'},
        {name: 'Venus', size: 3, orbitRadius: sunSize + (AU * 0.7), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.7, rotateSpeed: 0.05, img:'./assets/model/venus.jpeg'},
        {name: 'Earth', size: 3, orbitRadius: sunSize + AU, orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.6, rotateSpeed: 0.05, img:'./assets/model/earth2.jpg'},
        {name: 'Mars', size: 1.6, orbitRadius: sunSize + (AU * 1.5), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.48, rotateSpeed: 0.05, img:'./assets/model/mars.jpeg'},
        {name: 'Jupiter', size: 34.99, orbitRadius: sunSize + (AU * 5.2), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.22, rotateSpeed: 0.05, img:'./assets/model/jupiter.jpeg'},
        {name: 'Saturn', size: 29.1, orbitRadius: sunSize + (AU * 9.5), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.18, rotateSpeed: 0.05, img:'./assets/model/saturn.png'},
        {name: 'Uranus', size: 12.7, orbitRadius: sunSize + (AU * 19.2), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.13, rotateSpeed: 0.05, img:'./assets/model/uranus.jpeg'},
        {name: 'Neptune', size: 12.3, orbitRadius: sunSize + (AU * 30.1), orbitAngle: getRandomArbitrary(360,360), orbitSpeed: 0.1, rotateSpeed: 0.05, img:'./assets/model/neptune.jpeg'},
        {name: 'Sun', size: sunSize, orbitRadius: 0, orbitAngle: 0, orbitSpeed: 0.1, rotateSpeed: 0.05, img:'./assets/model/sun.jpg'},
    ];
    var Shaders = {
        'earth' : {
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
                'gl_FragColor = vec4( 0.074, 0.996, 0.992, 1.0 ) * intensity;',
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
    const mercury = createStars(planetData[0].size, planetData[0].img, 10, "Mercury");
    const venus = createStars(planetData[1].size, planetData[1].img, 25, "Venus");
    const earth =createStars(planetData[2].size, planetData[2].img, 40, "Earth");
    const mars =createStars(planetData[3].size, planetData[3].img, 10, "Mars");
    const jupiter =createStars(planetData[4].size, planetData[4].img, 10, "Jupiter");
    const saturn =createStars(planetData[5].size, planetData[5].img, 10, "Saturn");
    const uranus =createStars(planetData[6].size, planetData[6].img, 10, "Uranus");
    const neptune =createStars(planetData[7].size, planetData[7].img, 10, "Neptune");
    const sun = createStars(planetData[8].size, planetData[8].img, 50, "Sun");
//sun glow
    createGlow(sun, new THREE.SphereGeometry(sunSize, 50, 50), Shaders['atmosphere'], 1.02);
    //createGlow(earth, new THREE.SphereGeometry(3, 40, 40), Shaders['earth'], 1.03); //earthGlow

    let allText = [];
    let earthDataGeo, earthDataMesh;
    let baseGeo = new THREE.Geometry();
    let baseMesh;
    let textSize = 3;
    let tooltipGeo, tooltipMesh;
    let preSelected= {'Country':''};
    let tooltip = document.getElementsByClassName('yw_tooltip')[0];

    function init() {

        scene.add(camera);
        scene.add(new THREE.AmbientLight(0xffffff));

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('solar-canvas').appendChild(renderer.domElement);//A canvas is automatically created by the renderer in the constructor.

        // controls, camera
        controls = new THREE.OrbitControls( camera, renderer.domElement );
        controls.enableZoom = false;
        controls.target.set( 375, 0, 0 );
        camera.position.set( 375, 0, 2000 );
        // camera.position.set( 200, 18, 2000 );
        controls.update();//must be called after any manual changes to the camera's transform

        raycaster = new THREE.Raycaster();

        //document.getElementById('solar-canvas').appendChild( stats.dom );

        //create saturn ring
        const saturnSize = 29.1;
        let saturnRingMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture('./assets/model/saturnRing.png'),
            flatShading: THREE.SmoothShading,
            side: THREE.DoubleSide,
            transparent: true
        });
        const saturnRingStart = saturnSize + 3.3;
        const saturnRingEnd = saturnSize + 60;
        const saturnRing = new THREE.Mesh( new THREE.RingGeometry(saturnRingStart, saturnRingEnd, 30), saturnRingMaterial);
        saturn.add(saturnRing);
        saturnRing.rotation.x = 90 * Math.PI / 180;

        new THREE.FontLoader().load('./assets/model/helvetiker_regular.typeface.json', function(font) {
            mercuryText = createText(mercury, mercuryText, planetData[0].name, font);
            venusText = createText(venus, venusText, planetData[1].name, font);
            earthText = createText(earth, earthText, planetData[2].name, font);
            marsText = createText(mars, marsText, planetData[3].name, font);
            saturnText = createText(saturn, saturnText, planetData[4].name, font);
            jupiterText = createText(jupiter, jupiterText, planetData[5].name, font);
            uranusText = createText(uranus, uranusText, planetData[6].name, font);
            neptuneText = createText(neptune, neptuneText, planetData[7].name, font);
            allText=[mercuryText, venusText, earthText, marsText, saturnText, jupiterText, uranusText, neptuneText];
        });
//cube
        const earthCubeSize = 10;
        earthDataGeo = new THREE.BoxGeometry( earthCubeSize, earthCubeSize, earthCubeSize, 1 );
        earthDataGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-0.5));
        earthDataMesh = new THREE.Mesh(earthDataGeo);

        //helper
        // gui.add(camera.position, 'x', -2000, 10000);
        // gui.add(camera.position, 'y', -2000, 10000);
        // gui.add(camera.position, 'z', -2000, 10000);

        addData();

        //tooltip

        tooltipGeo = new THREE.BoxGeometry(10, 10, 10, 1);
        tooltipGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-0.5));
        const tooltipMat =  new THREE.MeshBasicMaterial( {color: 0xffffff} );
        tooltipMesh = new THREE.Mesh(tooltipGeo,tooltipMat);
        tooltipMesh.name = 'tooltip_mesh';
        scene.add(tooltipMesh);
    }



    function createText(planet, planetText, text, font) {
        const textGeometry = new THREE.TextGeometry(text, {
            font: font,
            size: textSize,
            bevelEnabled: false,
            height: 1
        });
        planetText = new THREE.Mesh(textGeometry, textMaterial);
        planet.add(planetText);
        return planetText
    }
    function getMax(data, attr) {
        return data.reduce((max, p) => p[attr] > max ? p[attr] : max, data[0][attr]);
    }
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
    function planetRotate(planet, text, id, yTextPos, xTextPos, textSize) {
        if(!yTextPos) yTextPos=0;
        var data = planetData[id];
        //let radians = planetData[id].orbitAngle * Math.PI / 180;
        planet.position.x = planetData[id].orbitRadius;
        planet.position.z = 0;
        planet.position.y = 0;
        //planet.rotation.y += planetData[id].rotateSpeed;
        text.position.x = planetData[id].size + xTextPos/camera.zoom;
        text.position.y =yTextPos;
        text.position.z = 0;
        text.scale.set(textSize,textSize,textSize);
        // text.scale()
        text.needsUpdate = true;
    }

    function resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix(); //Updates the camera projection matrix. Must be called after any change of parameters.
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    function createStars(size, img, segment, name) {
        let textureLoader = new THREE.TextureLoader();
        const material = new THREE.MeshLambertMaterial({
            map: textureLoader.load(img),
            flatShading: THREE.SmoothShading
        });
        const planet = new THREE.Mesh(new THREE.SphereGeometry(size, segment, segment), material);
        planet.name = name;
        scene.add(planet);
        return planet;
    }

    function addData(){
// Promise
        const requestData = request('GET', './assets/model/allCountries.json');
// call our promise
        requestData
            .then(processData)
            .then(addToEarth)
            .then(fulfilled => console.log(fulfilled))
            .catch(error => console.log(error.message));
    }

    function request(method, url) {
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = resolve;
            xhr.onerror = reject;
            xhr.send();
        });
    }

    function processData(data) {
        return new Promise(
            (resolve, reject) => {
                const newData = JSON.parse(data.target.responseText);
                console.log('process data');
                newData.forEach(function (t) {
                    addPoint(+t.Latitude,+t.Longitude, 0, getColor(+t['Population']), baseGeo);
                })
                self.data = newData;
                baseGeo.morphTargets.push({'name': 'target-'+0, vertices: baseGeo.vertices});
                for(let i=0; i<3; i++){
                    const attr = category[i];
                    const maxInAttr = getMax(newData, attr);
                    console.log(attr, maxInAttr);
                    let subGeo = new THREE.Geometry();
                    newData.forEach(function (d) {
                        const size = +d[attr]/maxInAttr/2; // linearScale
                        addPoint(+d.Latitude,+d.Longitude, size, getColor(size), subGeo);
                    })
                    baseGeo.morphTargets.push({'name': 'target-'+(i+1), vertices: subGeo.vertices});
                }
                resolve();
            }
        );
    }
    function addToEarth() {
        baseMesh= new THREE.Mesh(baseGeo, new THREE.MeshBasicMaterial({
            color: 0xffff00,
            vertexColors: THREE.FaceColors,
            morphTargets: true,
        }))
        earth.add(baseMesh);
        console.log(baseMesh);
        const message = 'added baseMesh';
        return Promise.resolve(message);
    }

    function createGlow(planet, geometry, shader, scale) {
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
        mesh.scale.set( scale, scale, scale );
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        planet.add(mesh); // the glow
    }
// animate();
    function animate() {
        const param = Math.sqrt(camera.zoom).toFixed(2);
        const xTextPos = 30 / param;
        const newTextSize = textSize/camera.zoom;
        planetRotate(mercury, mercuryText, 0, -30/param, xTextPos, newTextSize);
        planetRotate(venus, venusText, 1, -15/param, xTextPos, newTextSize);
        planetRotate(earth, earthText, 2, 0/param, xTextPos, newTextSize);
        planetRotate(mars, marsText, 3, 15/param, xTextPos, newTextSize);
        planetRotate(jupiter, jupiterText, 4, 30/param, xTextPos, newTextSize);
        planetRotate(saturn, saturnText, 5, 30/param, xTextPos, newTextSize);
        planetRotate(uranus, uranusText, 6, 10/param, xTextPos, newTextSize);
        planetRotate(neptune, neptuneText, 7, 10/param, xTextPos, newTextSize);
        camera.updateProjectionMatrix();
        sun.position.x = 0;
        sun.position.z = 0;
        sun.position.y = 0;
        //stats.update();
        TWEEN.update();
        //The code below doesn't work. It cannot get right texts
        // eightPlanets.forEach(function (planet, id) {
        //     planetRotate(planet, allText[id], id);
        // })

        render();

        requestAnimationFrame(animate);
    }

    function shrinkFonts(){

    }


    function addPoint(lat, lng, size, color, geo) {
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (360 - lng) * Math.PI / 180;
        const r = 3
        earthDataMesh.position.x = r * Math.sin(phi) * Math.cos(theta);
        earthDataMesh.position.y = r * Math.cos(phi);
        earthDataMesh.position.z = r * Math.sin(phi) * Math.sin(theta);
        earthDataMesh.scale.z = -size;
        earthDataMesh.scale.x = 1/400;
        earthDataMesh.scale.y = 1/400;
        earthDataMesh.lookAt(new THREE.Vector3( 0, 0, 0 ));
        earthDataMesh.updateMatrix();
        for (let i = 0; i < earthDataMesh.geometry.faces.length; i++) {
            earthDataMesh.geometry.faces[i].color = color;
        }
        // earthDataMesh.material = material? material : new THREE.MeshBasicMaterial();
        earthDataMesh.updateMatrix();
        //console.log(earthDataMesh);
        geo.merge(earthDataMesh.geometry, earthDataMesh.matrix);
    }

    function onDocumentMouseMove( event ) {
        event.preventDefault();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    function getColor(x) {

        const color = x > 100000000? new THREE.Color("rgb(255, 130, 0)") : new THREE.Color("rgb(0, 255, 255)")
        return color
    };

    //TODO: add raycaster to baseMesh
    function render() {
        camera.lookAt(earth.position);
        renderer.render(scene, camera);
        raycaster.setFromCamera( mouse, camera );
        if(baseMesh!= undefined){
            intersects = raycaster.intersectObject( baseMesh );
            if ( intersects.length > 0 ) {
                if ( INTERSECTED != intersects[ 0 ].faceIndex ) {
                    const selectedMesh = intersects[0].object;
                    INTERSECTED = Math.floor(intersects [ 0 ].faceIndex/12);
                    showTooltip(INTERSECTED);
                }
            } else if ( INTERSECTED !== null ) {
                INTERSECTED = null;
                tooltip.classList.remove("active");
                // intersects[0].object.geometry.scale(new THREE.Vector3( 1, 1, 1 ));
            }
        }


    }

    this.__defineSetter__('time', function(t) {
        //console.log('setTime: ', t);
        // t= 0, 1/3, 2/3
        //morphTransition(t);
        this._time = t;
    });

    this.__defineGetter__('time', function() {
        return this._time || 0;
    });


    function showTooltip(selected) {
        const selectedData = self.data[selected];
        if(selectedData != undefined &&selectedData['Country'] != preSelected['Country']){
            console.log(selectedData);
            tooltip.classList.add("active");
            console.log(selectedData['Country']);
            tooltip.innerHTML =`<p><strong>${selectedData['Country']}</strong></br>
            Population: ${addCommas(selectedData['Population'])}</br>
            GDP: ${addCommas(selectedData['GDP'])} $ per capita</br>
            Literacy rate: ${selectedData['Literacy']}% </p>`;
        }
    }

    function addCommas(nStr) {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    function getBaseMesh() {
        if(baseMesh!= undefined){
            return baseMesh
        }
    }

    function getCamera() {
        return camera
    }


    window.addEventListener('resize', resize);
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    this.init = init;
    this.resize = resize;
    this.animate= animate;
    this.getCamera = getCamera;
    this.getBaseMesh = getBaseMesh;


    return this;
}

export default Graphic
