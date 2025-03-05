import * as THREE from 'three';

export class Animation4 {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.time = 0;
  }
  
  init() {
    // Create a waving flag-like plane
    const geometry = new THREE.PlaneGeometry(10, 6, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2288ff,
      side: THREE.DoubleSide,
      wireframe: false,
      metalness: 0.2,
      roughness: 0.8,
    });
    
    this.flag = new THREE.Mesh(geometry, material);
    this.scene.add(this.flag);
    this.objects.push(this.flag);
    
    // Create stars in the background
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 500;
    
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 50;
      
      sizes[i] = Math.random() * 2.0;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffffff,
      sizeAttenuation: true
    });
    
    this.stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(this.stars);
    this.objects.push(this.stars);
  }
  
  update() {
    this.time += 0.05;
    
    // Update flag vertices to create a wave effect
    const vertices = this.flag.geometry.attributes.position;
    
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const y = vertices.getY(i);
      
      // Create wave pattern
      const waveX1 = 0.5 * Math.sin(this.time * 0.5 + x * 0.5);
      const waveX2 = 0.25 * Math.sin(this.time * 1 + x * 1);
      const waveY = 0.1 * Math.sin(this.time * 0.7 + y * 2);
      
      // Apply wave to Z position
      vertices.setZ(i, waveX1 + waveX2 + waveY);
    }
    
    vertices.needsUpdate = true;
    this.flag.geometry.computeVertexNormals();
    
    // Rotate flag
    this.flag.rotation.y = Math.sin(this.time * 0.1) * 0.2;
    
    // Rotate stars slowly
    this.stars.rotation.y += 0.001;
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
