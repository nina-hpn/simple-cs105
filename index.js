import { color, controllers, GUI } from './scripts/libs/dat.gui.module.js';
import { Texture } from './scripts/libs/three.module.js';
import { TransformControls } from './scripts/libs/TransformControls.js';
import { TeapotBufferGeometry } from './scripts/libs/TeapotBufferGeometry.js'
import * as THREE from './scripts/libs/three.module.js'
import { OrbitControls } from './scripts/libs/OrbitControls.js';
import { Roboto } from './scripts/libs/TextGeometry.js';
//import { BellBold } from './scripts/libs/TextGeometry.js';

//Note things that we want to do
//Making difference camera affects
// Modified scene color
// Creating more geometry
//Set Material is having abit of a problem

//Define text on header;
var text = 'This is SIMPLE - Final Project'
addTexttoHeader(text, 'auxiliary');

var canvas = document.getElementById('webgl');
var controller = new GIO.Controller( canvas );


//Define basic scene objs
var scene, camera, renderer;
var mesh, texture;
var material = new THREE.MeshBasicMaterial({color: 0xffffff});
var planeMaterial;

material.needsUpdate = true;

//Define gui and controls elements
var obj = {
    message: 'Final Project CS105 - Graphics',
    displayOutline: false,

    maxSize: 6.0,

}

const gui = new GUI( { autoPlace: false } );
var control, orbit, gridHelper;
var mouse = new THREE.Vector2();

var planeFolder, objectFolder, AMBLightFolder;

//All about the lights
var raycaster, PointLightHelper, meshPlane, light, ambientLight;;

//Define basic Gemetry

var type_material;


var BoxGeometry = new THREE.BoxGeometry(30, 30, 30, 40, 40, 40);
var SphereGeometry = new THREE.SphereGeometry(20, 20, 20);
var ConeGeometry = new THREE.ConeGeometry(18, 30, 32, 20);
var CylinderGeometry = new THREE.CylinderGeometry(20, 20, 40, 30, 5);
var TorusGeometry = new THREE.TorusGeometry(20, 5, 20, 100);
var TeapotGeometry = new TeapotBufferGeometry(20, 8);
var DodecahedronGeometry = new THREE.DodecahedronBufferGeometry(25);
var IcosahedronGeometry = new THREE.IcosahedronBufferGeometry(25);
var OctahedronGeometry =  new THREE.OctahedronBufferGeometry(25);
var TetrahedronGeometry = new THREE.TetrahedronBufferGeometry(25);
var PlaneGeometry = new THREE.PlaneBufferGeometry(80, 80);
var CircleGeometry = new THREE.CircleGeometry(80,80);
var RingGeometry = new THREE.RingGeometry(80,80);
var TextGeometry;



init();
render();

function init() {
    // Scene
    scene = createScene();

    //Camera 
    camera = createCamera();
    
    //Renderer
    renderer = createRenderer();
    

    // Auxiliary 

    //Grid
    gridHelper = createGridHelper();
    scene.add(gridHelper);

    //Orbit Controls
    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();
    orbit.addEventListener('change', render);

    control = new TransformControls(camera, renderer.domElement);
    control.addEventListener('change', render);
    control.addEventListener('dragging-changed', function(event) {
        orbit.enabled = !event.value;
    })

    // Raycaster
    raycaster = new THREE.Raycaster();



    canvas.appendChild(renderer.domElement);

    //canvas.addEventListener('mousedown', onMouseDown, false);
}

function render() {

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    renderer.render(scene, camera);
}

// Make the canvas responsive
window.addEventListener('resize', () => {
    var width = window.innerWidth
    var height = window.innerHeight
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    render()
})

// Create basic scene elements
function createScene() {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color('black');
    scene.name = 'scene';
    scene.autoUpdate = true;
    return scene;
}

function createCamera(x=1, y=50, z=100) {
    var fov = 75;
    var aspect = window.innerWidth / window.innerHeight;
    var near = 0.1;
    var far = 10000;

    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(x, y, z);
    camera.lookAt(new THREE.Vector3(0,0,0));

    return camera;
}

function createRenderer() {
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enable = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    return renderer;
}

function createGridHelper() {
    var size = 300;
    var division = 50;
    var gridHelper = new THREE.GridHelper(size, division, 0x888888);
    return gridHelper;
}

// GUI Controllers




// Resolve mesh and objects

function CloneMesh(dummy_mesh) {
    // Inherit all name, position and animation that is currently on the old mesh 
    // Put it on the new one
    mesh.name = dummy_mesh.name;
    mesh.position.set(dummy_mesh.position.x, dummy_mesh.position.y, dummy_mesh.position.z);
	mesh.rotation.set(dummy_mesh.rotation.x, dummy_mesh.rotation.y, dummy_mesh.rotation.z);
	mesh.scale.set(dummy_mesh.scale.x, dummy_mesh.scale.y, dummy_mesh.scale.z);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
    scene.add(mesh);
    control_transform(mesh);
}



window.setMaterial = function(mat='phong', color=0xffffff, size=0.5, wireframe=true, transparent=true) {
    mesh = scene.getObjectByName('main-obj');
    light = scene.getObjectByName('light');
    type_material = mat;
    color = new THREE.Color(color);

    if (mesh) {
        const dummy_mesh = mesh.clone();
        scene.remove(mesh);

        switch(type_material) {
            case 'point':
                material = new THREE.PointsMaterial({ color: color, size: size});
                break;

            case 'basic':
                material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe});
                break;

            case 'line':
                material = new THREE.LineBasicMaterial( {
                    color: color,
                    linewidth: 1,
                    linecap: 'round',
                    linejoin: 'round'
                });
                break;
            case 'normal':
                material = new THREE.MeshNormalMaterial({ color: color});

            case 'phong':
                material = new THREE.MeshPhongMaterial({color: color});
                break;

            case 'lambert':
                if (!light) 
                    material = new THREE.MeshBasicMaterial({map: texture,  color: color });
                else
                    material = new THREE.MeshLambertMaterial({map: texture, color: color});
                break;
            default:
                material = new THREE.MeshBasicMaterial({ color: color });

        }
        mesh = new THREE.Mesh(dummy_mesh.geometry, material);
        mesh.castShadow= true;
        mesh.receiveShadow = true;
        CloneMesh(dummy_mesh);
    }
    render();
}

window.setTexture = function(url='./graphics/textures/wood-walnut.jpg') {
    mesh = scene.getObjectByName('main-obj');
    if(mesh) {
        texture = new THREE.TextureLoader().load(url, render);
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        window.setMaterial(4);
    }
}

var obj_params = {
    color: 0xffffff
}
let size= 80,
    height= 80,
    curveSegments= 6,
    bevelEnabled= true,
    bevelThickness= 0.03,
    bevelSize= 0.02,
    bevelOffset= 0,
    bevelSegments= 4;

function createTextGeometry() {
    var text = document.getElementById('insertedText').value;
    TextGeometry = new THREE.TextBufferGeometry( text, {
        font: Roboto.regular,
        size: size,
        height: height,
        curveSegments: curveSegments,

        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled
    })
    TextGeometry.computeBoundingBox();
    return TextGeometry;
}

window.renderGeometry= function(id) {
    mesh = scene.getObjectByName('main-obj');
    scene.remove(mesh);
    if(mesh) {
        gui.removeFolder(objectFolder);
    }

    switch(id) {
        case 'box':
			mesh = new THREE.Mesh(BoxGeometry, material);
			break;
		case 'sphere':
			mesh = new THREE.Mesh(SphereGeometry, material);
			break;
		case 'cone':
			mesh = new THREE.Mesh(ConeGeometry, material);
			break;
		case 'cylinder':
			mesh = new THREE.Mesh(CylinderGeometry, material);
			break;
		case 'torus':
			mesh = new THREE.Mesh(TorusGeometry, material);
			break;
		case 'tea-pot':
			mesh = new THREE.Mesh(TeapotGeometry, material);
			break;
		case 'icosa':
			mesh = new THREE.Mesh(IcosahedronGeometry, material);
			break;
		case 'dode':
			mesh = new THREE.Mesh(DodecahedronGeometry, material);
			break;
		case 'octa':
			mesh = new THREE.Mesh(OctahedronGeometry, material);
			break;
		case 'tetra':
			mesh = new THREE.Mesh(TetrahedronGeometry, material);
			break;
        case 'circle':
            mesh = new THREE.Mesh(CircleGeometry, material);
			break;
        case 'ring':
            mesh = new THREE.Mesh(RingGeometry, material);
			break;
        case 'text':
            TextGeometry = createTextGeometry();
            mesh = new THREE.Mesh(TextGeometry, material);
            console.log(mesh)
			break;
        case 'tree':
            mesh = new THREE.Mesh(TreeGeometry, material);
        default:
            mesh = new THREE.Mesh(BoxGeometry, material);
            break;
    }
    mesh.name = 'main-obj';
    mesh.castShadow = true;
	mesh.receiveShadow = true;
	scene.add(mesh);
	control_transform(mesh);

    objectFolder = gui.addFolder('Object');
    objectFolder.addColor( obj_params, 'color')
        .onChange(function() {
            mesh.material.color.set( new THREE.Color(obj_params.color) );
            mesh.material.needsUpdate = true;
        });
    objectFolder.open();
	render();
}



window.displayPlane = function() {
    var checked = document.querySelector('input[id="plane"]:checked');
    if(checked) {
        console.log('checked');
        //Adding Plane to current env
        planeMaterial = new THREE.MeshPhongMaterial(params);
        planeMaterial.side = THREE.DoubleSide;
        meshPlane = new THREE.Mesh(PlaneGeometry, planeMaterial);

        meshPlane.rotation.x = Math.PI / 2;
        meshPlane.position.y = -30
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
        console.log(meshPlane);
    
        planeFolder.open();

        
        render();
    }
    else {
        console.log('unchecked');
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

    text = 'T for translate, R for rotate, S for scale, L for PointLight ON, press spacebar for PointLight OFF'
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
    requestAnimationFrame(animate);
    render();
}

// GUI Controls

var params = {
    color: 0xffffff
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
	light.position.set(0, 70, 0);
    light.name = name;

    return light
}

window.setPointLight= function() {
    light = scene.getObjectByName('light');

    if(!light) {
        light = createPointLight();
        scene.add(light);
        control_transform(light);

        PointLightHelper = new THREE.PointLightHelper(light);
        PointLightHelper.name = 'light-helper';
        scene.add(PointLightHelper);

        render();
    }

}

window.removeLight = function() {
    if(control.object) {
        if(control.object.name == 'light')
            // What if there is not mesh there
            for (var i of scene.children) {
                if(i.name == 'main-obj' || i.name == 'plane') {
                    control.object = i;
                    break;
                } 
            }
    }
    scene.remove(light);
    scene.remove(PointLightHelper);

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