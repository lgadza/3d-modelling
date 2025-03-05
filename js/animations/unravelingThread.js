import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export class Animation8 {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.time = 0;
    this.duration = {
      intro: 3,       // Tight thread stable state
      loosening: 4,   // Thread begins to loosen
      unraveling: 5,  // Full unraveling
      dissolution: 4, // Thread completely unravels
      aftermath: 3    // Empty space / impact
    };
    this.totalDuration = Object.values(this.duration).reduce((a, b) => a + b, 0);
    this.fontLoader = new FontLoader();
    
    // Thread and strand elements
    this.threadGroup = null;
    this.mainThread = null;
    this.threadStrands = [];
    this.looseningPoints = [];
    
    // Particle systems
    this.threadParticles = [];
    this.glowingPoints = [];
    
    // Colors and settings
    this.colors = {
      thread: 0x00FFFF,     // Bright cyan for main thread
      glow: 0x88FFFF,       // Softer cyan for glow
      strands: 0xAAFFFF,    // Light cyan for strands
      particles: 0xFFFFFF,  // White for particles
      background: 0x070723  // Deep blue for background
    };
    
    this.threadSegments = 100;  // Number of segments in the thread
    this.threadThickness = 0.1; // Thickness of main thread
    this.threadLength = 10;     // Length of the thread
  }
  
  init() {
    // Set camera position
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 0, 15);
    }
    
    // Set dark background
    this.scene.background = new THREE.Color(this.colors.background);
    
    // Create the main thread and visual elements
    this.createThread();
    this.createParticleSystem();
    this.createTitle();
    
    // Setup lighting for dramatic effect
    this.setupLighting();
    
    // Initial positions/state
    this.resetAnimation();
  }
  
  setupLighting() {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x222244, 1);
    this.scene.add(ambientLight);
    this.objects.push(ambientLight);
    
    // Add directional light for subtle shading
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
    this.objects.push(directionalLight);
    
    // Add point light at thread center for glow effect
    const threadLight = new THREE.PointLight(this.colors.glow, 2, 10);
    threadLight.position.set(0, 0, 0);
    this.scene.add(threadLight);
    this.objects.push(threadLight);
    
    // Create light beams around the thread
    for (let i = 0; i < 3; i++) {
      const spotLight = new THREE.SpotLight(this.colors.glow, 1, 15, Math.PI / 8, 0.5);
      const angle = (i / 3) * Math.PI * 2;
      spotLight.position.set(
        Math.cos(angle) * 5,
        Math.sin(angle) * 5,
        3
      );
      spotLight.lookAt(0, 0, 0);
      this.scene.add(spotLight);
      this.objects.push(spotLight);
    }
  }
  
  createThread() {
    // Create a group to hold all thread elements
    this.threadGroup = new THREE.Group();
    
    // Create the main straight thread using tube geometry
    const threadPath = new THREE.LineCurve3(
      new THREE.Vector3(-this.threadLength/2, 0, 0),
      new THREE.Vector3(this.threadLength/2, 0, 0)
    );
    
    const threadGeometry = new THREE.TubeGeometry(
      threadPath,
      this.threadSegments,
      this.threadThickness,
      12,
      false
    );
    
    const threadMaterial = new THREE.MeshPhongMaterial({
      color: this.colors.thread,
      emissive: this.colors.thread,
      emissiveIntensity: 0.5,
      shininess: 100,
      specular: 0xffffff
    });
    
    this.mainThread = new THREE.Mesh(threadGeometry, threadMaterial);
    this.threadGroup.add(this.mainThread);
    
    // Store the original vertices for animation purposes
    this.originalVertices = [];
    const positionAttribute = this.mainThread.geometry.getAttribute('position');
    for (let i = 0; i < positionAttribute.count; i++) {
      this.originalVertices.push(
        new THREE.Vector3(
          positionAttribute.getX(i),
          positionAttribute.getY(i),
          positionAttribute.getZ(i)
        )
      );
    }
    
    // Create thread strands (initially hidden)
    for (let i = 0; i < 12; i++) {
      // Create smaller strand geometry
      const strandPath = new THREE.LineCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
      );
      
      const strandGeometry = new THREE.TubeGeometry(
        strandPath,
        10,
        this.threadThickness / 3,
        6,
        false
      );
      
      const strandMaterial = new THREE.MeshPhongMaterial({
        color: this.colors.strands,
        emissive: this.colors.strands,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.7
      });
      
      const strand = new THREE.Mesh(strandGeometry, strandMaterial);
      
      // Randomly position along the thread
      const position = Math.random() * this.threadLength - this.threadLength / 2;
      strand.position.set(position, 0, 0);
      
      // Hide initially
      strand.visible = false;
      
      // Store in array for animation
      this.threadStrands.push(strand);
      this.threadGroup.add(strand);
    }
    
    // Add thread group to scene
    this.scene.add(this.threadGroup);
    this.objects.push(this.threadGroup);
    
    // Create glowing sheath around thread
    const glowGeometry = new THREE.CylinderGeometry(
      this.threadThickness * 2,
      this.threadThickness * 2,
      this.threadLength,
      16
    );
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.colors.glow,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });
    
    this.glowSheath = new THREE.Mesh(glowGeometry, glowMaterial);
    this.glowSheath.rotation.z = Math.PI / 2; // Align with thread
    this.threadGroup.add(this.glowSheath);
  }
  
  createParticleSystem() {
    // Create particle system for thread dissolution
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    
    // Initialize particle positions along the thread
    for (let i = 0; i < particleCount; i++) {
      // Random position along thread
      const x = Math.random() * this.threadLength - this.threadLength / 2;
      
      // Small random offset from center
      const y = (Math.random() - 0.5) * 0.1;
      const z = (Math.random() - 0.5) * 0.1;
      
      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;
      
      // Random sizes
      particleSizes[i] = Math.random() * 0.05 + 0.02;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    
    // Create particle material with custom shader for glowing effect
    const particleMaterial = new THREE.PointsMaterial({
      color: this.colors.particles,
      size: 0.1,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.particleSystem.visible = false; // Hide initially
    this.scene.add(this.particleSystem);
    this.objects.push(this.particleSystem);
  }
  
  createTitle() {
    // Create title text
    this.fontLoader.load('/fonts/helvetiker_bold.typeface.json', (font) => {
      const textGeometry = new TextGeometry('UNRAVELING', {
        font: font,
        size: 1,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
      });
      
      textGeometry.center();
      
      const textMaterial = new THREE.MeshStandardMaterial({
        color: this.colors.thread,
        metalness: 0.8,
        roughness: 0.2,
        emissive: this.colors.thread,
        emissiveIntensity: 0.5
      });
      
      this.titleText = new THREE.Mesh(textGeometry, textMaterial);
      this.titleText.position.set(0, -5, 0);
      
      this.scene.add(this.titleText);
      this.objects.push(this.titleText);
    });
  }
  
  updateStage(elapsed) {
    // Calculate which stage we're in based on elapsed time
    let timeSum = 0;
    
    // Stage 1: Intro - Tight thread stable state
    if (elapsed < (timeSum += this.duration.intro)) {
      const progress = elapsed / this.duration.intro;
      return { stage: 1, progress };
    }
    
    // Stage 2: Loosening - Thread begins to loosen
    if (elapsed < (timeSum += this.duration.loosening)) {
      const progress = (elapsed - (timeSum - this.duration.loosening)) / this.duration.loosening;
      return { stage: 2, progress };
    }
    
    // Stage 3: Unraveling - Full unraveling
    if (elapsed < (timeSum += this.duration.unraveling)) {
      const progress = (elapsed - (timeSum - this.duration.unraveling)) / this.duration.unraveling;
      return { stage: 3, progress };
    }
    
    // Stage 4: Dissolution - Thread completely unravels
    if (elapsed < (timeSum += this.duration.dissolution)) {
      const progress = (elapsed - (timeSum - this.duration.dissolution)) / this.duration.dissolution;
      return { stage: 4, progress };
    }
    
    // Stage 5: Aftermath - Empty space / impact
    if (elapsed < (timeSum += this.duration.aftermath)) {
      const progress = (elapsed - (timeSum - this.duration.aftermath)) / this.duration.aftermath;
      return { stage: 5, progress };
    }
    
    // Loop back to beginning
    return { stage: 0, progress: 0 };
  }
  
  update() {
    const deltaTime = 0.016; // Approx 60fps
    this.time += deltaTime;
    
    const elapsed = this.time % this.totalDuration;
    const { stage, progress } = this.updateStage(elapsed);
    
    // Animation sequences based on stage
    switch (stage) {
      case 0: // Reset
        this.resetAnimation();
        break;
        
      case 1: // Intro - Tight thread stable state
        this.animateIntroduction(progress);
        break;
        
      case 2: // Loosening - Thread begins to loosen
        this.animateLoosening(progress);
        break;
        
      case 3: // Unraveling - Full unraveling
        this.animateUnraveling(progress);
        break;
        
      case 4: // Dissolution - Thread completely unravels
        this.animateDissolution(progress);
        break;
        
      case 5: // Aftermath - Empty space / impact
        this.animateAftermath(progress);
        break;
    }
    
    // Update particle systems
    this.updateParticleSystems(deltaTime);
  }
  
  resetAnimation() {
    // Reset thread to initial state
    if (this.mainThread) {
      // Reset thread geometry to straight line
      const positionAttribute = this.mainThread.geometry.getAttribute('position');
      
      for (let i = 0; i < positionAttribute.count; i++) {
        if (this.originalVertices[i]) {
          positionAttribute.setXYZ(
            i,
            this.originalVertices[i].x,
            this.originalVertices[i].y,
            this.originalVertices[i].z
          );
        }
      }
      
      positionAttribute.needsUpdate = true;
      
      // Reset thread material
      this.mainThread.material.opacity = 1;
      this.mainThread.material.transparent = false;
      this.mainThread.visible = true;
    }
    
    // Reset thread strands
    for (const strand of this.threadStrands) {
      strand.visible = false;
      strand.scale.set(1, 1, 1);
      strand.material.opacity = 0.7;
    }
    
    // Reset glow sheath
    if (this.glowSheath) {
      this.glowSheath.material.opacity = 0.2;
      this.glowSheath.visible = true;
    }
    
    // Reset particle system
    if (this.particleSystem) {
      this.particleSystem.visible = false;
      
      const particlePositions = this.particleSystem.geometry.getAttribute('position');
      const particleCount = particlePositions.count;
      
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * this.threadLength - this.threadLength / 2;
        const y = (Math.random() - 0.5) * 0.1;
        const z = (Math.random() - 0.5) * 0.1;
        
        particlePositions.setXYZ(i, x, y, z);
      }
      
      particlePositions.needsUpdate = true;
    }
    
    // Reset title position
    if (this.titleText) {
      this.titleText.position.y = -5;
    }
    
    // Reset camera
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 0, 15);
    }
  }
  
  animateIntroduction(progress) {
    // Slightly pulse the thread to show it's alive
    const pulseIntensity = 0.2 + 0.1 * Math.sin(this.time * 5);
    this.mainThread.material.emissiveIntensity = pulseIntensity;
    
    // Rotate the thread slightly
    this.threadGroup.rotation.z = Math.sin(this.time) * 0.05;
    
    // Glow effect pulsing
    this.glowSheath.material.opacity = 0.15 + 0.1 * Math.sin(this.time * 3);
    
    // Title rises from bottom
    if (this.titleText) {
      this.titleText.position.y = -5 + progress * 3;
    }
    
    // Camera slowly moves around the thread
    if (window.app && window.app.camera) {
      const angle = this.time * 0.1;
      const radius = 15;
      window.app.camera.position.x = Math.sin(angle) * radius;
      window.app.camera.position.z = Math.cos(angle) * radius;
      window.app.camera.lookAt(0, 0, 0);
    }
  }
  
  animateLoosening(progress) {
    // Thread begins to warp and twist
    const positionAttribute = this.mainThread.geometry.getAttribute('position');
    const center = Math.floor(positionAttribute.count / 2); // Middle of the thread
    
    // Create a wave-like deformation increasing with progress
    for (let i = 0; i < positionAttribute.count; i++) {
      // Calculate distance from center (0 to 1)
      const distFromCenter = Math.abs(i - center) / center;
      
      // Apply wave deformation
      const waveAmplitude = progress * 0.5; // Increases with progress
      const waveFrequency = 3 + progress * 5;
      const wave = waveAmplitude * Math.sin(distFromCenter * waveFrequency + this.time * 2);
      
      // Apply twisting effect
      const twistAmount = progress * 0.3;
      const twist = Math.sin(distFromCenter * 10 + this.time) * twistAmount;
      
      if (this.originalVertices[i]) {
        positionAttribute.setXYZ(
          i,
          this.originalVertices[i].x,
          this.originalVertices[i].y + wave,
          this.originalVertices[i].z + twist
        );
      }
    }
    
    positionAttribute.needsUpdate = true;
    
    // Start showing small cracks/loose strands near the middle
    if (progress > 0.5) {
      // Show first few strands
      const strandsToShow = Math.min(
        Math.floor((progress - 0.5) * 2 * this.threadStrands.length),
        this.threadStrands.length
      );
      
      for (let i = 0; i < strandsToShow; i++) {
        this.threadStrands[i].visible = true;
        
        // Animate strand growth
        const strandProgress = (progress - 0.5) * 2;
        this.threadStrands[i].scale.set(strandProgress, strandProgress, strandProgress);
        
        // Animate strand position (wiggle)
        this.threadStrands[i].rotation.x = Math.sin(this.time * 3 + i) * 0.3;
        this.threadStrands[i].rotation.z = Math.cos(this.time * 2 + i) * 0.3;
      }
      
      // Start showing particles
      this.particleSystem.visible = true;
      this.particleSystem.material.opacity = (progress - 0.5) * 0.5;
    }
    
    // Intensify the glow near breaking points
    this.mainThread.material.emissiveIntensity = 0.5 + progress * 0.5;
    
    // Camera moves closer to see the detail
    if (window.app && window.app.camera) {
      const targetZ = 15 - progress * 5;
      window.app.camera.position.z = targetZ;
    }
  }
  
  animateUnraveling(progress) {
    // Thread fully unravels into separate strands
    
    // Main thread starts to fade
    this.mainThread.material.transparent = true;
    this.mainThread.material.opacity = 1 - progress * 0.8;
    
    // Deform the main thread more dramatically
    const positionAttribute = this.mainThread.geometry.getAttribute('position');
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const chaosFactor = progress * 1.5;
      const vertexTime = this.time * 3 + i * 0.05;
      
      if (this.originalVertices[i]) {
        positionAttribute.setXYZ(
          i,
          this.originalVertices[i].x + Math.sin(vertexTime) * chaosFactor,
          this.originalVertices[i].y + Math.cos(vertexTime * 0.7) * chaosFactor,
          this.originalVertices[i].z + Math.sin(vertexTime * 0.5) * chaosFactor
        );
      }
    }
    
    positionAttribute.needsUpdate = true;
    
    // All strands are now visible and animating
    for (let i = 0; i < this.threadStrands.length; i++) {
      const strand = this.threadStrands[i];
      strand.visible = true;
      
      // Scale strands up
      const growFactor = 1 + progress * 2;
      strand.scale.set(growFactor, growFactor, growFactor);
      
      // Move strands outward from the center
      const outwardDirection = new THREE.Vector3(
        strand.position.x > 0 ? 1 : -1,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      
      const outwardDistance = progress * 2;
      strand.position.add(outwardDirection.multiplyScalar(outwardDistance * 0.05));
      
      // Rotate strands chaotically
      strand.rotation.x += Math.sin(this.time * 2 + i) * 0.02;
      strand.rotation.y += Math.cos(this.time * 1.5 + i) * 0.02;
      strand.rotation.z += Math.sin(this.time * 1 + i) * 0.02;
    }
    
    // Glow sheath starts to break apart
    this.glowSheath.material.opacity = 0.2 - progress * 0.2;
    this.glowSheath.scale.y = 1 - progress * 0.5;
    
    // Particle system intensifies
    this.particleSystem.visible = true;
    this.particleSystem.material.opacity = 0.5 + progress * 0.5;
    
    // Camera rotation gets more dramatic
    if (window.app && window.app.camera) {
      const angle = this.time * (0.1 + progress * 0.2);
      const radius = 10 - progress * 2;
      window.app.camera.position.x = Math.sin(angle) * radius;
      window.app.camera.position.z = Math.cos(angle) * radius;
      window.app.camera.lookAt(0, 0, 0);
    }
  }
  
  animateDissolution(progress) {
    // Thread completely dissolves into particles
    
    // Main thread fades out completely
    this.mainThread.material.opacity = 0.2 * (1 - progress);
    
    // Strands fly apart and fade
    for (let i = 0; i < this.threadStrands.length; i++) {
      const strand = this.threadStrands[i];
      
      // Continue moving outward but faster
      const outwardDirection = new THREE.Vector3(
        strand.position.x,
        strand.position.y,
        strand.position.z
      ).normalize();
      
      const outwardSpeed = 0.1 + progress * 0.2;
      strand.position.add(outwardDirection.multiplyScalar(outwardSpeed));
      
      // Fade strands
      strand.material.opacity = 0.7 * (1 - progress);
      
      // Spin faster as they fly away
      strand.rotation.x += 0.05;
      strand.rotation.y += 0.07;
      strand.rotation.z += 0.06;
    }
    
    // Glow sheath disappears
    this.glowSheath.visible = (progress < 0.5);
    
    // Particles expand outward
    const particlePositions = this.particleSystem.geometry.getAttribute('position');
    const particleCount = particlePositions.count;
    
    for (let i = 0; i < particleCount; i++) {
      const x = particlePositions.getX(i);
      const y = particlePositions.getY(i);
      const z = particlePositions.getZ(i);
      
      // Calculate direction vector from center
      const dir = new THREE.Vector3(x, y, z).normalize();
      
      // Move particles outward
      const speed = 0.05 + progress * 0.1;
      particlePositions.setX(i, x + dir.x * speed);
      particlePositions.setY(i, y + dir.y * speed);
      particlePositions.setZ(i, z + dir.z * speed);
    }
    
    particlePositions.needsUpdate = true;
    
    // Camera pulls back to show the dissolution
    if (window.app && window.app.camera) {
      const targetZ = 8 + progress * 7;
      window.app.camera.position.z += (targetZ - window.app.camera.position.z) * 0.05;
    }
    
    // Title moves to center
    if (this.titleText) {
      this.titleText.position.y = -2 + progress * 2;
    }
  }
  
  animateAftermath(progress) {
    // Show the empty space and impacts
    
    // Hide main thread completely
    this.mainThread.visible = false;
    
    // Hide all strands
    for (const strand of this.threadStrands) {
      strand.visible = false;
    }
    
    // Particles continue to expand but fade out
    this.particleSystem.material.opacity = (1 - progress) * 0.5;
    
    const particlePositions = this.particleSystem.geometry.getAttribute('position');
    const particleCount = particlePositions.count;
    
    for (let i = 0; i < particleCount; i++) {
      const x = particlePositions.getX(i);
      const y = particlePositions.getY(i);
      const z = particlePositions.getZ(i);
      
      // Slower expansion in aftermath
      const dir = new THREE.Vector3(x, y, z).normalize();
      const speed = 0.02;
      
      particlePositions.setX(i, x + dir.x * speed);
      particlePositions.setY(i, y + dir.y * speed);
      particlePositions.setZ(i, z + dir.z * speed);
    }
    
    particlePositions.needsUpdate = true;
    
    // Title glows more intensely at the center
    if (this.titleText) {
      this.titleText.material.emissiveIntensity = 0.5 + Math.sin(this.time * 2) * 0.3;
    }
    
    // Camera slowly revolves around empty space
    if (window.app && window.app.camera) {
      const angle = this.time * 0.05;
      const radius = 15;
      window.app.camera.position.x = Math.sin(angle) * radius;
      window.app.camera.position.z = Math.cos(angle) * radius;
      window.app.camera.lookAt(0, 0, 0);
    }
  }
  
  updateParticleSystems(deltaTime) {
    // Additional particle system updates
    if (this.particleSystem && this.particleSystem.visible) {
      // Update particle sizes for twinkling effect
      const sizes = this.particleSystem.geometry.getAttribute('size');
      
      for (let i = 0; i < sizes.count; i++) {
        const pulseFactor = 0.8 + Math.sin(this.time * 5 + i * 2.5) * 0.2;
        sizes.setX(i, sizes.getX(i) * pulseFactor);
      }
      
      sizes.needsUpdate = true;
    }
  }
  
  dispose() {
    // Clean up all objects
    this.objects.forEach(obj => {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(material => material.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    
    this.objects = [];
    this.threadStrands = [];
    this.originalVertices = [];
    
    // Reset camera if needed
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 0, 10);
    }
  }
}
