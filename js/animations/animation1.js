import * as THREE from 'three';

export class Animation1 {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
  }
  
  init() {
    // Create a cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x6699ff,
      metalness: 0.3,
      roughness: 0.4,
    });
    
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);
    this.objects.push(this.cube);
    
    // Add some additional cubes
    for (let i = 0; i < 10; i++) {
      const smallCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshStandardMaterial({
          color: 0xffffff * Math.random(),
          metalness: 0.3,
          roughness: 0.4,
        })
      );
      
      smallCube.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      
      this.scene.add(smallCube);
      this.objects.push(smallCube);
    }
  }
  
  update() {
    // Rotate cubes
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    
    this.objects.forEach(obj => {
      if (obj !== this.cube) {
        obj.rotation.x += 0.02;
        obj.rotation.y += 0.03;
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
