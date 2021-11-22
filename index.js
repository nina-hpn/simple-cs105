import { GUI } from './scripts/libs/dat.gui.module.js';
import { TransformControls } from './scripts/libs/TransformControls.js';

var scene, camera, renderer;


const gui = new GUI();

var control, orbit, raycaster, gridHelper;
var mouse = new THREE.Vector2();

init();
render();

function init() {
    // Scene
    scene = createScene();
    const sceneFolder = gui.addFolder('Scene');

    var defaultColor  = {
        color: scene.background
    }

    sceneFolder.addColor(defaultColor, 'color')
        .onChange( function() { 
            scene.background.set( new THREE.Color(defaultColor.color) )
        });

    //Camera 
    camera = createCamera();

    //Renderer
    renderer = createRenderer();
    

    // Auxiliary 
    gridHelper = createGridHelper();
    scene.add(gridHelper);

    orbit = new THREE.OrbitControls(camera, renderer.domElement);
    orbit.update();
    orbit.addEventListener('change', render);

    control = new TransformControls(camera, renderer.domElement);
    control.addEventListener('change', render);
    control.addEventListener('dragging-changed', function(event) {
        orbit.enabled = !event.value;
    })


    document.getElementById('webgl').appendChild(renderer.domElement);
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

function createScene() {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color('black');
    scene.name = 'scene'
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

function render() {
    renderer.render(scene, camera);
}