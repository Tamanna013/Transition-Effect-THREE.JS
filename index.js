import * as THREE from 'three';
import { getFXScene } from './FXScene.js';
import { getTransition } from './Transition.js';

const clock = new THREE.Clock();
let transition = null;
init();
animate();

function init() {
    const container = document.getElementById('container');

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const materialA = new THREE.MeshBasicMaterial({color: 0xFF0000, wireframe: true});
    const materialB = new THREE.MeshBasicMaterial({color: 0x0000FF, flatShading: true});
    const sceneA = getFXScene({renderer, material: materialA, clearColor: 0x000000});
    const sceneB = getFXScene({renderer, material: materialB, clearColor: 0x000000, needsAnimatedColor: true});
    transition = getTransition({renderer, sceneA, sceneB});
}

function animate() {
    requestAnimationFrame(animate);
    transition.render(clock.getDelta());
}