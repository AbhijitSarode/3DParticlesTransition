import * as THREE from 'three'
import gsap from 'gsap';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'

export default class Model {
    constructor (obj) {

        // Attributes
            // Model info
        this.name = obj.name
        this.file = obj.file

            // Model state info
        this.placeOnLoad = obj.placeOnLoad
        this.isActive = false

            // Color
        this.color1 = obj.color1
        this.color2 = obj.color2
        this.background = obj.background
        
            // Model loader & scene
        this.gltfLoader = new GLTFLoader()
        this.scene = obj.scene

        this.init()
    }

    init() {
        // Add .glb model to canvas
        this.gltfLoader.load(this.file, (response) => {

            // Retrieve model data
            this.mesh = response.scene.children[0]

            // Create model Shader i.e color, scale and randomness

            this.particlesMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uColor1: {value: new THREE.Color(this.color1)},
                    uColor2: {value: new THREE.Color(this.color2)},
                    uTime: {value: 0},
                    uScale: {value: 0},
                },
                vertexShader: `
                attribute vec3 aRandom;
                varying vec3 vPosition;
                uniform float uTime;
                uniform float uScale;
                
                void main() {
                    vPosition = position;
                    vec3 pos = position;
                    float time = uTime * 4.0;

                    pos.x += sin(time * aRandom.x) * 0.01;
                    pos.y += cos(time * aRandom.y) * 0.01;
                    pos.z += cos(time * aRandom.z) * 0.01;

                    pos.x *= uScale + sin(pos.y * 4.0 + time) * (1.0 - uScale);
                    pos.y *= uScale + sin(pos.z * 4.0 + time) * (1.0 - uScale);
                    pos.z *= uScale + sin(pos.x * 4.0 + time) * (1.0 - uScale);

                    pos *= uScale;

                    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = 8.0 / -mvPosition.z;
                  }`,
                fragmentShader: `
                varying vec3 vPosition;
                uniform vec3 uColor1;
                uniform vec3 uColor2;

                void main() {
                    vec3 color = vec3(1.0, 0.0, 0.0);
                    vec3 color1 = vec3(1.0, 0.0, 0.0);
                    vec3 color2 = vec3(1.0, 0.0, 0.0);
                    float depth = vPosition.z * 0.5 + 0.5;
                    color.r = 0.0;
                    
                    color = mix(uColor1, uColor2, depth);
                    gl_FragColor = vec4(color, depth * 0.3 + 0.2);
                  }`,
                transparent: true,
                depthTest: false,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })

            // Particles Geometry
            const sampler = new MeshSurfaceSampler(this.mesh).build()
            const particlesCount = 10000
            this.particlesGeometry = new THREE.BufferGeometry()

            // Create an array for points co-ordinates(x, y, z)
            const particlesPosition = new Float32Array(particlesCount * 3)
            const particlesRandomness = new Float32Array(particlesCount * 3)

            for (let index = 0; index < particlesCount; index++) {
                const newPosition = new THREE.Vector3() // Create a 1x3 threejs matrix
                sampler.sample(newPosition)

                
                particlesPosition.set([newPosition.x, newPosition.y, newPosition.z], index * 3) // Assigned threejs matrix to Float32Array
                particlesRandomness.set([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1], index * 3) // Fill array with random values
            }

            // Assigned values to BufferGeometry which is to be used in shader
            this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPosition, 3))
            this.particlesGeometry.setAttribute('aRandom', new THREE.BufferAttribute(particlesRandomness, 3))

            // Create particles
            this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial)

            // Show model when loaded for first time
            if (this.placeOnLoad) {
                this.add()
            }
        })
    }
    
    add() {
        this.scene.add(this.particles)
        this.isActive = true

        // Scale up animation on load
        gsap.to(this.particlesMaterial.uniforms.uScale, {
            value: 1,
            duration: 0.8,
            delay: 0.3,
            ease: 'power3.out'
        })

        // Rotation animation on click if model is already presented
        gsap.fromTo(this.particles.rotation, {
            y: Math.PI * 2
        },
        {
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        })

        // Background color change animation
        gsap.to('body',  {
            background: this.background,
            duration: 0.8
        })
    }
    
    remove() {
        // Scale down animation
        gsap.to(this.particlesMaterial.uniforms.uScale, {
            value: 0,
            duration: 0.8,
            ease: 'power3.out',
            onComplete: () => {
                // Executed after animation is completed
                this.scene.remove(this.particles)
                this.isActive = false
            }
        })
        
        gsap.fromTo(this.particles.rotation, {
            y: Math.PI
        },
        {
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        })
    }
}