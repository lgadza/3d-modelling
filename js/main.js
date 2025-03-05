import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Animation1 } from './animations/animation1.js';
import { Animation2 } from './animations/animation2.js';
import { Animation3 } from './animations/animation3.js';
import { Animation4 } from './animations/animation4.js';
import { Animation5 } from './animations/moneyTransfer.js';

class App {
  constructor() {
    this.container = document.getElementById('scene-container');
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#000000');
    
    this.createCamera();
    this.createLights();
    this.createRenderer();
    this.createControls();
    
    // Add to the global window object so animations can access camera
    window.app = this;
    
    this.currentAnimation = null;
    this.animations = {
      'animation-1': new Animation1(this.scene),
      'animation-2': new Animation2(this.scene),
      'animation-3': new Animation3(this.scene),
      'animation-4': new Animation4(this.scene),
      'animation-5': new Animation5(this.scene)
    };
    
    this.bindEvents();
    this.render();
  }
  
  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      35, // FOV
      window.innerWidth / window.innerHeight, // aspect
      0.1, // near clipping plane
      1000 // far clipping plane
    );
    this.camera.position.set(0, 0, 10);
  }
  
  createLights() {
    const ambientLight = new THREE.HemisphereLight(0xddeeff, 0x202020, 5);
    const mainLight = new THREE.DirectionalLight(0xffffff, 5);
    mainLight.position.set(10, 10, 10);
    
    this.scene.add(ambientLight, mainLight);
  }
  
  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.physicallyCorrectLights = true;
    
    this.container.appendChild(this.renderer.domElement);
  }
  
  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
  }
  
  bindEvents() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    document.getElementById('animation-1').addEventListener('click', () => this.switchAnimation('animation-1'));
    document.getElementById('animation-2').addEventListener('click', () => this.switchAnimation('animation-2'));
    document.getElementById('animation-3').addEventListener('click', () => this.switchAnimation('animation-3'));
    document.getElementById('animation-4').addEventListener('click', () => this.switchAnimation('animation-4'));
    document.getElementById('animation-5').addEventListener('click', () => this.switchAnimation('animation-5'));
    
    // Start with first animation
    this.switchAnimation('animation-1');
  }
  
  switchAnimation(animationId) {
    // Remove current animation if exists
    if (this.currentAnimation) {
      this.currentAnimation.dispose();
    }
    
    // Initialize new animation
    this.currentAnimation = this.animations[animationId];
    this.currentAnimation.init();
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  render() {
    requestAnimationFrame(this.render.bind(this));
    
    this.controls.update();
    
    if (this.currentAnimation) {
      this.currentAnimation.update();
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize the app when the DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
