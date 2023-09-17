import * as THREE from 'three'
import gsap from 'gsap';
import Model from './model';

/*------------------------------
Renderer
------------------------------*/
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild( renderer.domElement );


/*------------------------------
Scene & Camera
------------------------------*/
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 50, sizes.width / sizes.height, 1, 100 );
camera.position.z = 5;

/*------------------------------
Models
------------------------------*/
const skull = new Model({
    name: "skull",
    file: '/models/skull.glb',
    color1: 'red',
    color2: 'yellow',
    background: '#47001B',
    placeOnLoad: true,
    scene,
})

const horse = new Model({
    name: "horse",
    file: '/models/horse.glb',
    color1: 'blue',
    color2: 'pink',
    background:'#110047',
    scene
})

/*------------------------------
HTML Buttons
------------------------------*/
const buttons = document.querySelectorAll('button')

// Skull button
buttons[0].addEventListener('click', () => {
    skull.add()
    horse.remove()
})

// Horse button
buttons[1].addEventListener('click', () => {
    skull.remove()
    horse.add()
})


/*------------------------------
Animation
------------------------------*/
const clock = new THREE.Clock()

const animate = function () {
    
    // Play only skull animation
    if(skull.isActive) {
        skull.particlesMaterial.uniforms.uTime.value = clock.getElapsedTime()
    }
    
    // Play only horse animation
    if(horse.isActive) {
        horse.particlesMaterial.uniforms.uTime.value = clock.getElapsedTime()
    }
    
    renderer.render( scene, camera );
    
    requestAnimationFrame( animate );
};
animate();


/*------------------------------
Window Resize
------------------------------*/
function onWindowResize() {

    // Update size
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update rendrer
    renderer.setSize( sizes.width, sizes.height );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

window.addEventListener( 'resize', onWindowResize, false );

/*------------------------------
Mouse Move
------------------------------*/
window.addEventListener('mousemove', onMouseMove)

function onMouseMove(e) {
    const x = e.clientX
    const y = e.clientY

    gsap.to(scene.rotation, {
        x: gsap.utils.mapRange(0, sizes.height, 0.2, -0.2, y),
        y: gsap.utils.mapRange(0, sizes.width, 0.2, -0.2, x)
    })
}
