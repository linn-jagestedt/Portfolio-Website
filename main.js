import * as THREE from 'three';
import loadCompressedImage from './compressedImage.js';
import loadRefImage from './refImage.js';

const scene = new THREE.Scene();

let ratio = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(-ratio, ratio, 1, -1);
camera.position.z = 5; 

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', onWindowResize, false);

const texloader = new THREE.TextureLoader();
const texture = await texloader.load('textures/t132.png');
const resolution = new THREE.Vector2(512, 512);

loadCompressedImage(texture, resolution, scene);
loadRefImage(texture, resolution, scene)

animate();

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

function onWindowResize() {
	let ratio = window.innerWidth / window.innerHeight;
    camera.left = -ratio;
	camera.right = ratio
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}