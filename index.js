import { color, controllers, GUI } from './scripts/libs/dat.gui.module.js';
import { Texture } from './scripts/libs/three.module.js';
import { TransformControls } from './scripts/libs/TransformControls.js';
import { TeapotBufferGeometry } from './scripts/libs/TeapotBufferGeometry.js'
import * as THREE from './scripts/libs/three.module.js'
import { OrbitControls } from './scripts/libs/OrbitControls.js';
import Stats from './scripts/libs/stats.module.js'


var canvas = document.getElementById('webgl');
var controller = new GIO.Controller( canvas );
var clock = new THREE.Clock();




//Define basic scene objs
var scene, camera, renderer;
var mesh, texture;
var material = new THREE.MeshBasicMaterial({color: 0xffffff});
var specialMaterial, preMaterial = false, isBuffer = false;
var planeMaterial;
var time = 0, delta = 0;

material.needsUpdate = true;

//Define gui and controls elements
var obj = {
    message: 'Final Project CS105 - Graphics',
    displayOutline: false,

    maxSize: 6.0,
    
}
//Basic params for TextGeometry

let size= 10,
height= 10,
curveSegments= 10,
bevelEnabled= true,
bevelThickness= 0.01,
bevelSize= 0.02,
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


var BoxGeometry = new THREE.BoxBufferGeometry(500, 500, 500, 40, 40, 40);
var SphereGeometry = new THREE.SphereBufferGeometry(20, 20, 20);
var ConeGeometry = new THREE.ConeBufferGeometry(18, 30, 32, 20);
var CylinderGeometry = new THREE.CylinderBufferGeometry(20, 20, 40, 30, 5);
var TorusGeometry = new THREE.TorusBufferGeometry(20, 5, 20, 100);
var TeapotGeometry = new TeapotBufferGeometry(20, 8);
var DodecahedronGeometry = new THREE.DodecahedronBufferGeometry(25);
var IcosahedronGeometry = new THREE.IcosahedronBufferGeometry(25);
var OctahedronGeometry =  new THREE.OctahedronBufferGeometry(25);
var TetrahedronGeometry = new THREE.TetrahedronBufferGeometry(25);
var PlaneGeometry = new THREE.PlaneBufferGeometry(80, 80);
var CircleGeometry = new THREE.CircleBufferGeometry(80,80);
var RingGeometry = new THREE.RingBufferGeometry(80,80);
var TextGeometry;



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
    cameraFolder.add(camera.position, 'z', 0, 1000);
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
    scene.background = new THREE.Color('black');
    scene.name = 'scene';
    scene.autoUpdate = true;
    return scene;
}

function createCamera(x=300, y=500, z=1000) {
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
    var size = 1000;
    var division = 50;
    var gridHelper = new THREE.GridHelper(size, division, 0x888888);
    gridHelper.name = 'grid-helper';
    return gridHelper;
}

// Area for main-obj initialization and changing material

// Resolve mesh and objects

window.removeGeometry = function(name='all') {
    if(name == 'all') {
        console.log(control);
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
        }
        else {
            // If it is remove main-obj
            // Just remove all
            removeGeometry('all');
        }
    }
}

function CloneMesh(dummy_mesh) {
    // Inherit all name, position and animation that is currently on the old mesh 
    // Put it on the new one
    mesh.name = dummy_mesh.name;
    if(!isBuffer) {
        mesh.position.set(dummy_mesh.position.x, dummy_mesh.position.y, dummy_mesh.position.z);
        mesh.rotation.set(dummy_mesh.rotation.x, dummy_mesh.rotation.y, dummy_mesh.rotation.z);
        mesh.scale.set(dummy_mesh.scale.x, dummy_mesh.scale.y, dummy_mesh.scale.z);
    }
	mesh.castShadow = true;
	mesh.receiveShadow = true;
    scene.add(mesh);
    control_transform(mesh);
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



window.setMaterial = function(mat='phong', color=0xffffff, size=15, wireframe=true, transparent=true) {
    // Getting the current main-obj on screen and setting it with the chosen material 

    mesh = scene.getObjectByName('main-obj');
    light = scene.getObjectByName('light');
    type_material = mat;
    color = new THREE.Color(color);

    if (mesh) {
        var dummy_mesh = mesh.clone();
        scene.remove(mesh);

        switch(type_material) {
            case 'point':
                material = new THREE.PointsMaterial({ size: size, vertexColors: true});
                isBuffer = true;
                break;

            case 'basic':
                material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe});
                break;

            case 'line':
                material = new THREE.LineBasicMaterial( {
                    color: color,
                    linewidth: 10,
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
                material = new THREE.MeshPhongMaterial({ color: color });

        }
        // If it is point then use special technique
        if(preMaterial != 'point')
            createColorAndPositionOfBuffer()
        else
            createColorAndPositionOfBuffer(color);

        if(mat == 'point') {
            dummy_mesh = new THREE.BufferGeometry();
            dummy_mesh.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		    dummy_mesh.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
            dummy_mesh.computeBoundingSphere();
            mesh = new THREE.Mesh(dummy_mesh, material);
            colors = [];
            positions = [];
        }
        else {
            mesh = new THREE.Mesh(dummy_mesh.geometry, material);
        }
        preMaterial = mat;
        CloneMesh(dummy_mesh);
        isBuffer = false;
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
        console.log('checked');
        //Adding Plane to current env
        planeMaterial = new THREE.MeshPhongMaterial(params);
        planeMaterial.side = THREE.DoubleSide;
        meshPlane = new THREE.Mesh(PlaneGeometry, planeMaterial);

        meshPlane.receiveShadow = true;
        meshPlane.castShadow = true;

        meshPlane.rotation.x -= Math.PI / 2;
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

    text = 'T for translate, R for rotate, S for scale, L for Point/Spot Light ON, press spacebar for turn Point/Spot Light OFF'
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

window.initBasicAnimation = function() {
    // See if any box of animation has been checked
    var ani1 = document.querySelector('input[id="ani1"]:checked');
    var ani2 = document.querySelector('input[id="ani2"]:checked');
    var ani3 = document.querySelector('input[id="ani3"]:checked');

    var mesh = scene.getObjectByName('main-obj');
    if(mesh) {
        if(ani1) 
            mesh.rotation.x += 0.01;
        else
            mesh.rotation.x = 0

        if(ani2)
            mesh.rotation.y += 0.01;
        else 
            mesh.rotation.y = 0

        if(ani3)
            mesh.rotation.z += 0.01
        else 
            mesh.rotation.z = 0

    }
    requestAnimationFrame(initBasicAnimation)
}

window.Animation3 = function() {
    var mesh = scene.getObjectByName('main-obj');
    if(mesh) {
        delta = clock.getDelta();
        time += delta;
        mesh.position.y = 0.5 + Math.abs(Math.sin(time * 3)) * 2;;
        mesh.position.y = Math.cos(time) * 4;
        requestAnimationFrame(Animation3)
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
	light.position.set(0, 600, 0);
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
            for (var i of scene.children) {
                if(i.name == 'main-obj' || i.name == 'plane') {
                    control.object = i;
                    break;
                } 
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
function createSpotLight(color=0xffffff, intensity=1, decay=1, name='light') {
    var light = new THREE.SpotLight(new THREE.Color(color), intensity=intensity, decay=decay);
    light.castShadow = true;
    light.position.set(0, 70, 0);
    light.name = name;
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
    SLightFolder.addColor( pLight_params, 'color')
        .onChange( function() {
            light.color.set(new THREE.Color(pLight_params.color))
        })
    SLightFolder.add( pLight_params, 'intensity')
        .onChange( function() {
            light.intensity = pLight_params.intensity;
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
