import * as THREE from 'three';

export class Animation3 {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.time = 0;
  }
  
  init() {
    // Create a spiral of spheres
    const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    
    for (let i = 0; i < 100; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(i % 20 / 20, 1.0, 0.5),
        metalness: 0.4,
        roughness: 0.6,
      });
      
      const mesh = new THREE.Mesh(sphereGeometry, material);
      
      // Position in a spiral
      const angle = i * 0.2;
      const radius = 0.1 * i;
      mesh.position.set(
        Math.cos(angle) * radius,
        0.05 * i,
        Math.sin(angle) * radius
      );
      
      this.scene.add(mesh);
      this.objects.push(mesh);
    }
    
    // Add a central light
    this.pointLight = new THREE.PointLight(0xffffff, 15, 50);
    this.scene.add(this.pointLight);
    this.objects.push(this.pointLight);
  }
  
  update() {
    this.time += 0.01;
    
    // Animate spheres in the spiral
    this.objects.forEach((obj, i) => {
      if (i < this.objects.length - 1) { // Skip the light
        obj.position.y = Math.sin(this.time + i * 0.1) * 0.5 + 0.05 * i;
        
        // Pulse size
        const scale = 0.8 + Math.sin(this.time * 3 + i * 0.3) * 0.2;
        obj.scale.set(scale, scale, scale);
      }
    });
    
    // Move the light
    this.pointLight.position.x = Math.sin(this.time) * 3;
    this.pointLight.position.z = Math.cos(this.time) * 3;
    this.pointLight.position.y = Math.sin(this.time * 2) * 2;
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
