import { color, controllers, GUI } from './scripts/libs/dat.gui.module.js';
import { Texture } from './scripts/libs/three.module.js';
import { TransformControls } from './scripts/libs/TransformControls.js';
import { TeapotBufferGeometry } from './scripts/libs/TeapotBufferGeometry.js'
import * as THREE from './scripts/libs/three.module.js'
import { OrbitControls } from './scripts/libs/OrbitControls.js';
import Stats from './scripts/libs/stats.module.js';
import { MinMaxGUIHelper } from './scripts/libs/helper.js';


var canvas = document.getElementById('webgl');
var controller = new GIO.Controller( canvas );
var clock = new THREE.Clock();




//Define basic scene objs
var scene, camera, renderer;
var cameraHelper;
var mesh, texture;
var material = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });;
var pointMaterial = false;
var specialMaterial, preMaterial = false, isBuffer = false;
var planeMaterial;
var time = 0, delta = 0;

material.needsUpdate = true;

//Define gui and controls elements
//Basic params for TextGeometry

let size= 80,
height= 80,
curveSegments= 12,
bevelEnabled= true,
bevelThickness= 0.01,
bevelSize= 0.01,
bevelOffset= 0,
bevelSegments= 1;

const dic = {
    'Bell': '../../fonts/Bell MT_Regular.json',
	'Broadway': "../../fonts/Broadway_Regular.json",
	'Constantia': "../../fonts/Constantia_Regular.json",
	'Luna': "../../fonts/Luna_Regular.json",
	'Roboto': '../../fonts/Roboto_Regular.json',
	'Tahoma': '../../fonts/Tahoma_Regular.json'
}


//Define params for points material
var positions = [], colors = [];


const gui = new GUI( { autoPlace: false } );
var minMaxGUIHelper;
var control, orbit, gridHelper;
var mouse = new THREE.Vector2();

var planeFolder, objectFolder, AMBLightFolder, PLightFolder, cameraFolder, SLightFolder;

//All about the lights
var raycaster, PointLightHelper, meshPlane, light, ambientLight, SpotLightHelper;


// Adding the stat panel
var stats = new Stats();
stats.showPanel(0);
document.body.appendChild( stats.dom );


//Define basic Gemetry

var type_material;


var BoxGeometry = new THREE.BoxGeometry(100, 100, 100, 20, 20, 20);
var SphereGeometry = new THREE.SphereGeometry(100, 20, 20);
var ConeGeometry = new THREE.ConeGeometry(80, 100, 32, 20);
var CylinderGeometry = new THREE.CylinderGeometry(100, 100, 20, 20, 5);
var TorusGeometry = new THREE.TorusGeometry(100, 25, 20, 20);
var TeapotGeometry = new TeapotBufferGeometry(100, 20);
var DodecahedronGeometry = new THREE.DodecahedronGeometry(100);
var IcosahedronGeometry = new THREE.IcosahedronGeometry(100);
var OctahedronGeometry =  new THREE.OctahedronGeometry(100);
var TetrahedronGeometry = new THREE.TetrahedronGeometry(100);
var PlaneGeometry = new THREE.PlaneGeometry(2000, 2000);
var CircleGeometry = new THREE.CircleGeometry(100,150);
var TextGeometry, BufferGeometry;


init();
render();

//Define text on header;
var text = 'This is SIMPLE - Final Project'
addTexttoHeader(text, 'auxiliary');


// Basic function
function init() {
    // Scene
    scene = createScene();

    //Camera 
    camera = createCamera();
    cameraFolder = gui.addFolder('Camera');
    //console.log(camera);
    cameraFolder.add(camera.position, 'x', -1000, 1000);
    cameraFolder.add(camera.position, 'y', -1000, 1000);
    cameraFolder.add(camera.position, 'z', -1000, 1000);

    cameraFolder.open()
    
    //Renderer
    renderer = createRenderer();
    

    // Auxiliary 

    //Grid
    gridHelper = createGridHelper();
    scene.add(gridHelper);

    //Orbit Controls
    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.05;
    orbit.addEventListener('change', render);

    control = new TransformControls(camera, renderer.domElement);
    control.name = 'control';
    control.addEventListener('change', render);
    control.addEventListener('dragging-changed', function(event) {
        orbit.enabled = !event.value;
    })

    // Raycaster
    raycaster = new THREE.Raycaster();


    canvas.appendChild(renderer.domElement);
    canvas.addEventListener('mousedown', onMouseDown, false);

}

function render() {
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    // Make the canvas responsive
    var width = window.innerWidth
    var height = window.innerHeight
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    render()
})

// Create basic scene elements like camera, renderer or scene
function createScene() {
    var scene = new THREE.Scene();
    scene.name = 'scene';
    scene.autoUpdate = true;
    return scene;
}

function createCamera(x=300, y=300, z=400) {
    var fov = 75;
    var aspect = window.innerWidth / window.innerHeight;
    var near = 0.1;
    var far = 10000;

    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(x, y, z);
    camera.lookAt(new THREE.Vector3(0,0,0));

    return camera;
}

window.changeFOV = function() {
    var value = document.getElementById("FOV").value;
    camera.fov = Number(value);
    camera.updateProjectionMatrix();
}

window.changeNear = function() {
    var value = document.getElementById("Near").value;
    camera.near = Number(value);
    camera.updateProjectionMatrix();
}

window.changeFar = function() {
    var value = document.getElementById("Far").value;
    camera.far = Number(value);
    camera.updateProjectionMatrix();
}

function createRenderer() {
    var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(new THREE.Color(0xa9a9a9), 0)
    return renderer;
}

function createGridHelper() {
    var size = 5000;
    var division = 50;
    var gridHelper = new THREE.GridHelper(size, division, 0x888888);
    gridHelper.name = 'grid-helper';
    return gridHelper;
}

function onMouseDown(event) {
    event.preventDefault();
    if(event.button == 2) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(scene.children);
        
        // If there is any object need to use control at right click position
        // Change to it

        for(let i of intersects) {
            if(i.object.name == 'poinlight-helper' || i.object.name == 'spotlight-helper' || i.object.name == 'main-obj' || i.object.name == 'plane') {
                control_transform(i.object);
                break;
            }
        }
        render();
    }
}

// Area for main-obj initialization and changing material

// Resolve mesh and objects

window.removeGeometry = function(name='all') {
    if(name == 'all') {
        control.detach();
        for(let i = 0; i < scene.children.length; ++i) {
            var obj = scene.children[i]
            if(obj.name != 'grid-helper' && obj.name != 'control') {
                scene.remove(obj)
            }
        }
        for(let [key, value] of Object.entries(gui.__folders)) {
            if(key != 'Camera') {
                gui.removeFolder(value);
            }
        }
        addTexttoHeader('Done reset scene', 'auxiliary');
        setTimeout(() => {addTexttoHeader(text, 'auxiliary')}, 3000);
    }
    else {
        if(name != 'main-obj') {
            // If it is not main-obj
            // Check if there is main-obj on screen
            var test = scene.getObjectByName('main-obj');
            if(test) {
                // If there is main-obj
                // Move control to main-obj
                control.attach(test);
                var remove = scene.getObjectByName(name);
                scene.remove(remove);

                // Remove gui folder of obj with the same name
                for(let [key, value] of Object.entries(gui.__folders)) {
                    if(value.name == name) {
                        gui.removeFolder(value);
                    }
                }
            }
            addTexttoHeader('Done reset' + name, 'auxiliary');
            setTimeout(() => {addTexttoHeader(text, 'auxiliary')}, 3000);
        }
        else {
            // If it is remove main-obj
            // Just remove all
            removeGeometry('all');
        }
    }
}


function CloneMesh(dummy_mesh, obj=mesh) {
    // Inherit all name, position and animation that is currently on the old mesh 
    // Put it on the new one
    obj.name = dummy_mesh.name;
    obj.position.set(dummy_mesh.position.x, dummy_mesh.position.y, dummy_mesh.position.z);
    obj.rotation.set(dummy_mesh.rotation.x, dummy_mesh.rotation.y, dummy_mesh.rotation.z);
    obj.scale.set(dummy_mesh.scale.x, dummy_mesh.scale.y, dummy_mesh.scale.z);
	obj.castShadow = true;
	obj.receiveShadow = true;
    scene.add(obj);
    control_transform(obj);
}

function createColorAndPositionOfBuffer(setColor=false) {
    // Basic color for better display if haven't have setting color
    var particles = 20000;

    var color = new THREE.Color();
    var n = 1000, n2 = n / 2;

    for (let i = 0; i < particles; i++) {
        const x = Math.random() * n - n2;
        const y = Math.random() * n - n2;
        const z = Math.random() * n - n2;

        positions.push( x, y, z );

        if(!setColor) {
            // colors

            const vx = ( x / n ) + 0.5;
            const vy = ( y / n ) + 0.5;
            const vz = ( z / n ) + 0.5;

            color.setRGB( vx, vy, vz );

            colors.push( color.r, color.g, color.b );

        }
        else 
            colors.push( setColor.r, setColor.g, setColor.b);
    }
}



window.setMaterial = function(mat='point', obj='main-obj',color=0xffffff, size=3, wireframe=true, transparent=true) {
    // Getting the current main-obj on screen and setting it with the chosen material 

    type_material = mat;
    light = scene.getObjectByName('light');
    color = new THREE.Color(color);

    if(obj == 'main-obj') {
        // If this is setMaterial for main-obj
        mesh = scene.getObjectByName('main-obj');

        if (mesh) {
            var dummy_mesh = mesh.clone();
            scene.remove(mesh);

            switch(type_material) {
                case 'standard':
                    material = new THREE.MeshStandardMaterial({ color: color, side: THREE.DoubleSide });
                        pointMaterial = false;
                    break;
                case 'point':
                    material = new THREE.PointsMaterial({ size: size, vertexColors: true, side: THREE.DoubleSide, color: color});
                    pointMaterial = true;
                    break;

                case 'basic':
                    material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe, side: THREE.DoubleSide});
                        pointMaterial = false;
                    break;

                case 'normal':
                    material = new THREE.MeshNormalMaterial({ color: color, side: THREE.DoubleSide});

                case 'phong':
                    material = new THREE.MeshPhongMaterial({color: color, side: THREE.DoubleSide});
                        pointMaterial = false;
                    break;

                case 'lambert':
                    if (!light) 
                        material = new THREE.MeshBasicMaterial({map: texture,  color: color, side: THREE.DoubleSide });
                    else
                        material = new THREE.MeshLambertMaterial({map: texture, color: color, side: THREE.DoubleSide});
                        pointMaterial = false;
                        break;
                default:
                    material = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });

            }

            if(mat == 'point') {
                mesh = new THREE.Points(dummy_mesh.geometry, material);
            }
            else {
                mesh = new THREE.Mesh(dummy_mesh.geometry, material);
            }
            CloneMesh(dummy_mesh);
            render();
        
        }
    }
    else if (obj == 'plane') {
        meshPlane = scene.getObjectByName('plane');
        if(plane) {
            var dummy_plane = meshPlane.clone();
            scene.remove(meshPlane);

            switch(type_material) {
                case 'lambert':
                    if (!light) 
                        planeMaterial = new THREE.MeshBasicMaterial({map: texture,  color: color, side: THREE.DoubleSide });
                    else
                        planeMaterial = new THREE.MeshLambertMaterial({map: texture, color: color, side: THREE.DoubleSide});
                    break;
                default:
                    planeMaterial = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
            }
            meshPlane = new THREE.Mesh(PlaneGeometry, planeMaterial);
            CloneMesh(dummy_plane, meshPlane);
            render();
        }
    }

}

window.uploadImage = function(id='texture-obj') {
    console.log('Uploading');
    document.getElementById(id).click();
}

window.setTexture = function(url='./graphics/textures/wood-walnut.jpg', obj='main-obj') {
    mesh = scene.getObjectByName('main-obj');
    console.log(url);
    if(obj == 'main-obj') {  
        if(mesh) {
            texture = new THREE.TextureLoader().load(url, render);
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            setMaterial('lambert');
        }
    }
    else if(obj == 'plane') {
        if(mesh) {
            texture = new THREE.TextureLoader().load(url, render);
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            setMaterial('lambert', obj=obj);
        }
    }
}

window.uploadGeometry = function(id) {
    console.log('Uploading new Geometry');
    document.getElementById(id).click();
}

window.setLoaderGeometry = function(url='./graphics/buffergeometries/suzzane_buffergeometry.json') {
    mesh = scene.getObjectByName('main-obj');
    console.log(url);

    if(mesh) {
        scene.remove(mesh);
        control.detach();
        gui.removeFolder(objectFolder);

    }
    
    var geometry = new THREE.BufferGeometryLoader().load(
        // resource URL
        url,

        //onLoad callback 
        function ( geometry ) {
            geometry.computeVertexNormals();
            mesh = new THREE.Mesh( geometry, material);
            mesh.name = 'main-obj';
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            control_transform(mesh);
            //Adding GUI for control 
            objectFolder = gui.addFolder('Object');

            // Change mesh color
            objectFolder.addColor( obj_params, 'color')
                .onChange(function() {
                    mesh.material.color.set( new THREE.Color(obj_params.color) );
                    mesh.material.needsUpdate = true;
                });
            setTimeout(addTexttoHeader('Note that the loaded geometry is a bit too small, you can scale it using S'), 5000);



        },
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },

        // onError callback
        function ( err ) {
            console.log( err );
        }

    );
}

// Define some params control and text loader

var obj_params = {
    color: 0xffffff
}
const loader = new THREE.FontLoader(); 


window.renderGeometry= function(id, fontName='Tahoma') {
    // Setting the main-obj geometry

    mesh = scene.getObjectByName('main-obj');
    scene.remove(mesh);
    if(mesh) {
        gui.removeFolder(objectFolder);
    }
    //console.log(material);
    switch(id) {
        case 'box':  
            if(pointMaterial)
                mesh = new THREE.Points(BoxGeometry, material);
            else
                mesh = new THREE.Mesh(BoxGeometry, material);
			break;
		case 'sphere':
            if(pointMaterial)
                mesh = new THREE.Points(SphereGeometry, material);
			else 
                mesh = new THREE.Mesh(SphereGeometry, material);
			break;
		case 'cone':
            if(pointMaterial)
                mesh = new THREE.Points(ConeGeometry, material);
			else
                mesh = new THREE.Mesh(ConeGeometry, material);
			break;
		case 'cylinder':
            if(pointMaterial)
                mesh = new THREE.Points(CylinderGeometry, material);
			else
                mesh = new THREE.Mesh(CylinderGeometry, material);
			break;
		case 'torus':
            if(pointMaterial)
                mesh = new THREE.Points(TorusGeometry, material);
			else
                mesh = new THREE.Mesh(TorusGeometry, material);
			break;
		case 'tea-pot':
            if(pointMaterial)
                mesh = new THREE.Points(TeapotGeometry, material);
			else
                mesh = new THREE.Mesh(TeapotGeometry, material);
			break;
		case 'icosa':
            if(pointMaterial)
                mesh = new THREE.Points(IcosahedronGeometry, material);
            else
			    mesh = new THREE.Mesh(IcosahedronGeometry, material);
			break;
		case 'dode':
            if(pointMaterial)
                mesh = new THREE.Points(DodecahedronGeometry, material);
			
            else
                mesh = new THREE.Mesh(DodecahedronGeometry, material);
			break;
		case 'octa':
            if(pointMaterial)
                mesh = new THREE.Points(OctahedronGeometry, material);
            else
			    mesh = new THREE.Mesh(OctahedronGeometry, material);
			break;
		case 'tetra':
            if(pointMaterial)
                mesh = new THREE.Points(TetrahedronGeometry, material);
            else
			    mesh = new THREE.Mesh(TetrahedronGeometry, material);
			break;
        case 'circle':
            if(pointMaterial)
                mesh = new THREE.Points(CircleGeometry, material);
            else
                esh = new THREE.Mesh(CircleGeometry, material);
			break;
        case 'text':
            var text = document.getElementById('insertedText').value;
            loader.load( dic[fontName], 
                function(font) {
                    var geometry = 	new THREE.TextGeometry(text, {
                        font: font,
                        size: size,
                        height: height,
                        curveSegments: curveSegments,
                
                        bevelThickness: bevelThickness,
                        bevelSize: bevelSize,
                        bevelEnabled: bevelEnabled,
                        bevelOffset: bevelOffset,
                        bevelSegments: bevelSegments
                    })
                    geometry.computeBoundingBox();
                    if(pointMaterial)
                        mesh = new THREE.Points(geometry, material);
                    else
                        mesh = new THREE.Mesh(geometry, material);
                    mesh.name = 'main-obj';
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    scene.add(mesh);
                    control_transform(mesh);
                })
			break;
        case 'tree':
            mesh = new THREE.Mesh(TreeGeometry, material);
        default:
            mesh = new THREE.Mesh(BoxGeometry, material);
            break;
    }
    
    if(id != 'text') {
        scene.add(mesh);
        mesh.name = 'main-obj';
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        control_transform(mesh);
    }

    //Adding GUI for control 
    objectFolder = gui.addFolder('Object');

    // Change mesh color
    objectFolder.addColor( obj_params, 'color')
        .onChange(function() {
            mesh.material.color.set( new THREE.Color(obj_params.color) );
            mesh.material.needsUpdate = true;
        });
    objectFolder.open();
    render();
}

// GUI Controls

var params = {
    color: 0xffffff,
}

window.displayPlane = function() {
    var checked = document.querySelector('input[id="plane"]:checked');
    if(checked) {
        //console.log('checked');
        //Adding Plane to current env
        planeMaterial = new THREE.MeshStandardMaterial(params);
        planeMaterial.side = THREE.DoubleSide;
        meshPlane = new THREE.Mesh(PlaneGeometry, planeMaterial);

        meshPlane.receiveShadow = true;
        meshPlane.castShadow = true;

        meshPlane.rotation.x -= Math.PI / 2;
        meshPlane.position.y = -150
        meshPlane.name = 'plane'
        scene.add(meshPlane);
        control_transform(meshPlane);


        planeFolder = gui.addFolder('Plane');
        planeFolder.addColor( params, 'color')
            .onChange( function() { 
                meshPlane.material.color.set( new THREE.Color(params.color) );
                meshPlane.material.needsUpdate = true;
            });
        ;
        
        //console.log(meshPlane);
    
        planeFolder.open();

        
        render();
    }
    else {
        //console.log('unchecked');
        //Remove it from current env
        meshPlane = scene.getObjectByName('plane');
        if (meshPlane) {
            gui.removeFolder(planeFolder);
            control.detach();
            scene.remove(meshPlane);
        }
    }
}

// Animation and controls

function control_transform(mesh) {
    control.attach(mesh);
    scene.add(control);

    text = 'T for translate, R for rotate, S for scale, L for Point Light ON, press spacebar for turn Point/Spot Light OFF, right click on object to move control.'
    addTexttoHeader(text);

    window.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
            case 84: // T
                control.setMode("translate")
                break;
            case 82: // R
                control.setMode("rotate")
                break;
            case 83: // S
                control.setMode("scale")
                break;
            case 76: // L
                setPointLight(); 
                break;
            case 32: // spacebar
                removeLight(); 
                break;
        }
    });
}

function animate() {
    stats.begin()
    requestAnimationFrame(animate);
    render();
    stats.end();
}

function displayRange(id = 'x') {
    document.getElementById(id).style = "display:block";
    document.getElementById('out' + id).style = "display:visible;"
    document.getElementById('label_' + id).style = "display:visible;"
}

function notDisplayRange(id = 'x') {
    document.getElementById(id).style = "display:none";
    document.getElementById('out' + id).style = "display:none";
    document.getElementById('label_' + id).style = "display:none";
}

var ax = 0.01, ay=0.01, az=0.01;
window.initBasicAnimation = function() {
    // See if any box of animation has been checked
    var ani1 = document.querySelector('input[id="ani1"]:checked');
    var ani2 = document.querySelector('input[id="ani2"]:checked');
    var ani3 = document.querySelector('input[id="ani3"]:checked');

    var mesh = scene.getObjectByName('main-obj');
    if(mesh) {
        if(ani1) {
            mesh.rotation.x += ax;
            displayRange('x');
        }
        else{
            mesh.rotation.x = 0;
            notDisplayRange('x');
        }

        if(ani2){
            mesh.rotation.y += ay;
            displayRange('y');
        }
        else {
            mesh.rotation.y = 0;
            notDisplayRange('y');
        }

        if(ani3){
            mesh.rotation.z += az;
            displayRange('z');
        }
        else {
            mesh.rotation.z = 0;
            notDisplayRange('z');
        }

    }
    requestAnimationFrame(initBasicAnimation)
}

window.setX = function(num) {
    ax = Number(num);
}

window.setY = function(num) {
    ay = Number(num);
}

window.setZ = function(num) {
    az = Number(num);
}


var amplitude = 500;
var idAnimation3;

function displayAmplitude() {
    document.getElementById('amplitude').style = "display:block";
    document.getElementById('outAmplitude').style = "display:visible;"
    document.getElementById('label_amplitude').style = "display:visible;"
}



window.setAmplitude = function(amp) {
    amplitude = amp;
}

window.Animation3 = function() {
    // Floating affect
    var mesh = scene.getObjectByName('main-obj');
    removeAnimation(5);
    if(mesh) {
        delta = clock.getDelta();
        time += delta;
        mesh.position.x = 0.5 + Math.abs(Math.sin(time * 3)) * amplitude / 50;;
        mesh.position.y = Math.cos(time) * amplitude / 20;
        displayAmplitude();
        idAnimation3 = requestAnimationFrame(Animation3)
    }
}

var idAnimation4;
window.Animation4 = function() {
    // Going in round
    var mesh = scene.getObjectByName('main-obj');
    removeAnimation(4);
    if(mesh) {
        delta = clock.getDelta();
        time += delta;
        mesh.rotation.y += 0.03;

        mesh.position.x = amplitude*Math.cos(time) + 0;
        mesh.position.z = amplitude*Math.sin(time) + 0;
        displayAmplitude();
        idAnimation4 = requestAnimationFrame(Animation4)
    }
}

var idAnimation5;
var go = true;
window.Animation5 = function() {
    // Going in zic zac
    var mesh = scene.getObjectByName('main-obj');
    removeAnimation(5);
    if(mesh) {
        delta = clock.getDelta();
        time += delta;
        mesh.position.x = amplitude / 2 * Math.sin(time);

        if(time % 2 == 1) {
            mesh.position.z += amplitude / 150;
        } 
        else {
            mesh.position.z -= amplitude / 150;
        }
        displayAmplitude();
        idAnimation5 = requestAnimationFrame(Animation5);
    }
}

window.removeAnimation = function(id='all') {
    var mesh = scene.getObjectByName('main-obj');
    if(mesh && id == 'all') {
        var ani1 = document.querySelector('input[id="ani1"]:checked');
        var ani2 = document.querySelector('input[id="ani2"]:checked');
        var ani3 = document.querySelector('input[id="ani3"]:checked');

        if(ani1 || ani2 || ani3) {
            document.getElementById("ani1").checked = false;
            document.getElementById("ani2").checked = false;
            document.getElementById("ani3").checked = false;
        }

        if(idAnimation3)
            cancelAnimationFrame(idAnimation3);
        if(idAnimation4)
            cancelAnimationFrame(idAnimation4);
        if(idAnimation5)
            cancelAnimationFrame(idAnimation5);

        mesh.rotation.set(0,0,0);

        document.getElementById('amplitude').style = "display:none";
        document.getElementById('outAmplitude').style = "display:none"
        document.getElementById('label_amplitude').style = "display:none"
    }
    else if (mesh && id != 'all') {
        // Here the id is what we want to keep
        var lis = [false, false, false, idAnimation3, idAnimation4, idAnimation5];
        for (let i = 3; i <= lis.length; ++i) {
            if(i != id + 1) {
                if(lis[i])
                    cancelAnimationFrame(lis[i])
            }
        }
    }
}

var customContainer = $('.gui').append($(gui.domElement));

// Auxiliary function
function addTexttoHeader(text = 'Hello Word', id='auxiliary'){
    var already = document.getElementById(id);
    if (already.innerHTML) 
        already.textContent = text
    else
        {
            var element = document.createElement('a');
            element.href = './index.html'
            element.className = 'title';
            element.innerText = text;
            already.appendChild(element)
        }
}


//Point Lights

function createPointLight(color=0xffffff, intensity=2, name='light') {
    var light = new THREE.PointLight(new THREE.Color(color), intensity);
    light.castShadow = true;
	light.position.set(0, 250, 0);
    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default
    light.shadow.focus = 1; // default
    light.name = name;

    return light
}

var pLight_params = {
    color: 0xffffff,
    decay: 1,
    intensity: 2
}

window.setPointLight= function() {
    light = scene.getObjectByName('light');

    if(light) 
        removeLight();
    
    light = createPointLight();
    scene.add(light);
    control_transform(light);

    PointLightHelper = new THREE.PointLightHelper(light);
    PointLightHelper.name = 'pointlight-helper';
    scene.add(PointLightHelper);

    PLightFolder = gui.addFolder('PointLight');
    PLightFolder.addColor( pLight_params, 'color')
        .onChange( function() {
            light.color.set(new THREE.Color(pLight_params.color))
        })
    PLightFolder.add( pLight_params, 'intensity')
        .onChange( function() {
            light.intensity = pLight_params.intensity;
        })
    render();

}

window.removeLight = function() {
    if(control.object) {
        if(control.object.name == 'light')
            // What if there is not mesh there
            var len = scene.children.length;
            for (var i of scene.children) {
                len--;
                if(i.name == 'main-obj' || i.name == 'plane') {
                    control.object = i;
                    break;
                } 
                if(len == 0) 
                    control.detach();
            }
    }
    
    // Remove light folder
    for(let [key, value] of Object.entries(gui.__folders)) {
        if(value.name == 'PointLight' || value.name == 'SpotLight') {
            gui.removeFolder(value);
        }
    }

    // Remove helper from scene
    for(let i of scene.children) {
        if(i.name == 'spotlight-helper' || i.name == 'pointlight-helper') {
            scene.remove(i)
        }
    }

    // Remove light
    scene.remove(light);

    render();
}

// SpotLightHelper Light
var sLight_params = {
    color: 0xffffff,
    intensity: 2
}

function createSpotLight(color=0xffffff, intensity=2, decay=1, name='light') {
    var light = new THREE.SpotLight(new THREE.Color(color), intensity=intensity);
    light.castShadow = true;
    light.position.set(0, 250, 0);
    light.name = name;
    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default
    light.shadow.focus = 1; // default
    return light;
}

window.setSpotLight= function() {
    light = scene.getObjectByName('light');

    if(light)   
        removeLight();

    console.log(gui);

    light = createSpotLight();
    scene.add(light);
    control_transform(light);
    
    SpotLightHelper = new THREE.SpotLightHelper(light);
    SpotLightHelper.name = 'spotlight-helper';
    scene.add(SpotLightHelper);

    SLightFolder = gui.addFolder('SpotLight');
    SLightFolder.addColor( sLight_params, 'color')
        .onChange( function() {
            light.color.set(new THREE.Color(sLight_params.color))
        })
    SLightFolder.add( sLight_params, 'intensity')
        .onChange( function() {
            light.intensity = sLight_params.intensity;
        })
    render();

}

//Ambient Light
var AMBDefault = {
    color: 0x404040,
}
function createAmbientLight(color=0x404040, intensity=5) {
    var name = 'ambient-light'; 
    ambientLight = new THREE.AmbientLight(color, intensity);
    ambientLight.name = name;
    return ambientLight
}

window.setAmbientLight = function() {
    ambientLight = createAmbientLight();
    scene.add(ambientLight);

    AMBLightFolder = gui.addFolder('Ambient Light');
    AMBLightFolder.addColor( AMBDefault, 'color')
        .onChange( function() {
            ambientLight.color.set(new THREE.Color(AMBDefault.color));
        })
}

window.removeAmbientLight = function() {
    gui.removeFolder(AMBLightFolder);
    scene.remove(ambientLight);
}

window.displayAmbient = function() {
    var checked = document.querySelector('input[id="ambient"]:checked');
    if(checked) {
        console.log('Turn on ambient');
        setAmbientLight();
    }
    else {
        console.log("Turn off ambient");
        removeAmbientLight();
    }
}

animate()
