import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import coordinates from "../coordinates.json"
let scene, camera, renderer, water;

init()
animate()

function init() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 25, 0)
    camera.lookAt(scene.position)

    //LIGHT
    const light = new THREE.HemisphereLight()
    scene.add(light)

    //HELPER
    const gridHelper = new THREE.GridHelper(50, 50)
    scene.add(gridHelper)

    //RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    document.body.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 5;
    controls.maxDistance = 50;

    //UPLOAD
    const inputeContainer = document.createElement('div');
    inputeContainer.style.position = "absolute"
    inputeContainer.style.bottom = "20px"
    inputeContainer.style.right = "20px"
    inputeContainer.style.color = "white"
    const inputElement = document.createElement('input');

    inputeContainer.appendChild(inputElement)
    document.body.appendChild(inputeContainer)
    document.body.style.margin = 0
    document.body.style.padding = 0
    inputElement.type = "file"
    inputElement.accept = ".json"
    inputElement.addEventListener('change', handleFileSelect)

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function handleFileSelect(event) {
    const fileInput = event.target;
    const files = fileInput.files;

    if (files.length > 0) {
        const selectedFile = files[0];
        readFileContents(selectedFile);
    }
}

function readFileContents(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const fileContents = event.target.result;
        validateJSON(fileContents);
    };

    reader.readAsText(file, 'UTF-8');
}

function validateJSON(data) {
    // Parse the JSON data
    const dataArray = JSON.parse(data);

    try {


        // Define the required keys
        const requiredKeys = ['color', 'position', 'width', 'height'];

        // Check if each object in the array has the required keys
        const allObjectsHaveKeys = dataArray.every(obj => {
            return requiredKeys.every(key => key in obj);
        });

        if (allObjectsHaveKeys) {
            console.log('All objects in the array have the required keys.');
        } else {
            console.log('One or more objects in the array are missing required keys.');
            prompt('Incorrect Format!\nMake sure all JSON Blocks have a "width", "height", "position", and "color" key')
        }



    } catch (error) {
        console.error('Error parsing JSON:', error.message);
    }

    try {
        // Parse the JSON data
        const positionValues = dataArray.reduce((agr, curr) => {
            agr.push(curr.position)
            return agr
        }, [])

        positionValues.every(item => {
            if (item.length === 2 && typeof item[0] === 'number' && typeof item[1] === 'number') {
                console.log("All position values are valid")
                spawnCuboids(dataArray)
            } else {
                prompt('Please ensure that all position coordinates are numbers with only 2 values. Like this. ---> "position": [5, 10]')
            }
        })


    } catch (error) {
        console.error('Error parsing JSON:', error.message);
    }

}

const spawnCuboids = (data) => {
    console.log("Spawning Cuboids")
    data.forEach(item => {
        const cuboidGeo = new THREE.BoxGeometry(item.width, item.height)
        const cuboidMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(item.color) })
        const cuboidMesh = new THREE.Mesh(cuboidGeo, cuboidMat)
        cuboidMesh.position.set(item.position[0], 0, item.position[1])
        scene.add(cuboidMesh)
    })

}


function animate() {
    requestAnimationFrame(animate);

    render();
}

function render() {

    renderer.render(scene, camera);

}
