import * as THREE from 'three';

export class Animation2 {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.time = 0;
  }
  
  init() {
    // Create a torus
    const geometry = new THREE.TorusGeometry(3, 1, 16, 100);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff5533,
      metalness: 0.7,
      roughness: 0.2,
    });
    
    this.torus = new THREE.Mesh(geometry, material);
    this.scene.add(this.torus);
    this.objects.push(this.torus);
    
    // Add particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    
    const posArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffffff
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(particlesMesh);
    this.objects.push(particlesMesh);
  }
  
  update() {
    this.time += 0.01;
    
    // Animate torus
    this.torus.rotation.x = this.time * 0.5;
    this.torus.rotation.y = this.time * 0.3;
    
    // Wave animation
    this.objects.forEach((obj, i) => {
      if (i > 0) { // Skip the torus
        obj.rotation.y = this.time * 0.1;
      }
    });
  }
  
  dispose() {
    // Remove all objects from scene
    this.objects.forEach(obj => {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    this.objects = [];
  }
}
