import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export class Animation9 {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.time = 0;
    this.bricks = [];
    this.brickHeight = 0.5;
    this.brickWidth = 2;
    this.brickDepth = 1;
    this.foundation = null;
    this.totalBricks = 12;
    this.stackedBricks = 0;
    this.duration = {
      foundation: 2,  // Foundation appears
      stacking: 10,   // Bricks stack one by one
      completion: 3   // Final glow/celebration
    };
    this.totalDuration = Object.values(this.duration).reduce((a, b) => a + b, 0);
    this.fontLoader = new FontLoader();
    this.animationComplete = false;
  }
  
  init() {
    // Setup camera
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 5, 15);
      window.app.camera.lookAt(0, 4, 0);
    }
    
    // Set neutral background
    this.scene.background = new THREE.Color(0x202030);
    
    // Create foundation and prepare bricks
    this.createFoundation();
    this.prepareBricks();
    this.createTitle();
    
    // Setup lighting
    this.setupLighting();
  }
  
  setupLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x444444, 1);
    this.scene.add(ambientLight);
    this.objects.push(ambientLight);
    
    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    
    // Adjust shadow properties for better quality
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    
    this.scene.add(mainLight);
    this.objects.push(mainLight);
    
    // Secondary light for more depth
    const secondaryLight = new THREE.PointLight(0x6688cc, 1, 20);
    secondaryLight.position.set(-5, 3, 5);
    this.scene.add(secondaryLight);
    this.objects.push(secondaryLight);
    
    // Create subtle glow for final brick
    this.finalGlow = new THREE.PointLight(0x00ffff, 0, 10);
    this.finalGlow.position.set(0, this.brickHeight * (this.totalBricks + 1), 0);
    this.scene.add(this.finalGlow);
    this.objects.push(this.finalGlow);
  }
  
  createFoundation() {
    // Create foundation - wider than the bricks
    const foundationGeometry = new THREE.BoxGeometry(
      this.brickWidth * 1.5, 
      this.brickHeight * 0.5, 
      this.brickDepth * 1.5
    );
    const foundationMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.7,
      roughness: 0.5
    });
    
    this.foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    this.foundation.position.y = -this.brickHeight * 0.5; // Bottom of the scene
    this.foundation.receiveShadow = true;
    this.foundation.castShadow = true;
    
    // Start with foundation invisible (will fade in)
    this.foundation.material.transparent = true;
    this.foundation.material.opacity = 0;
    
    this.scene.add(this.foundation);
    this.objects.push(this.foundation);
  }
  
  prepareBricks() {
    // Create bricks but don't add to scene yet
    for (let i = 0; i < this.totalBricks; i++) {
      const isFinal = i === this.totalBricks - 1;
      
      // Create brick geometry
      const brickGeometry = new THREE.BoxGeometry(
        this.brickWidth, 
        this.brickHeight, 
        this.brickDepth
      );
      
      // Different material for final brick
      const brickMaterial = new THREE.MeshStandardMaterial({
        color: isFinal ? 0x4488ff : 0x888888,
        metalness: isFinal ? 0.9 : 0.3,
        roughness: isFinal ? 0.2 : 0.8,
        emissive: isFinal ? 0x0088ff : 0x000000,
        emissiveIntensity: isFinal ? 0.5 : 0
      });
      
      const brick = new THREE.Mesh(brickGeometry, brickMaterial);
      
      // Calculate final position but don't place yet
      const yPosition = i * this.brickHeight;
      
      // Store brick information
      brick.userData = {
        targetY: yPosition,
        originalColor: brick.material.color.clone(),
        isFinal: isFinal
      };
      
      // Make brick invisible initially
      brick.material.transparent = true;
      brick.material.opacity = 0;
      brick.visible = false;
      brick.castShadow = true;
      brick.receiveShadow = true;
      
      // Add slight rotation variation for more natural look
      if (!isFinal) {
        const angleVariation = 0.02;
        brick.rotation.y = (Math.random() - 0.5) * angleVariation;
        brick.rotation.z = (Math.random() - 0.5) * angleVariation;
      }
      
      this.bricks.push(brick);
      this.scene.add(brick);
      this.objects.push(brick);
      
      // For the final brick, create a glow effect
      if (isFinal) {
        const glowGeometry = new THREE.BoxGeometry(
          this.brickWidth * 1.1,
          this.brickHeight * 1.1,
          this.brickDepth * 1.1
        );
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.0,
          side: THREE.BackSide
        });
        
        this.finalBrickGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.finalBrickGlow.visible = false;
        this.scene.add(this.finalBrickGlow);
        this.objects.push(this.finalBrickGlow);
      }
    }
  }
  
  createTitle() {
    // Create title text
    this.fontLoader.load('/fonts/helvetiker_bold.typeface.json', (font) => {
      const textGeometry = new TextGeometry('POWER TRANSFER', {
        font: font,
        size: 0.7,
        height: 0.1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 3
      });
      
      textGeometry.center();
      
      const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xffffff,
        emissiveIntensity: 0.2
      });
      
      this.titleText = new THREE.Mesh(textGeometry, textMaterial);
      this.titleText.position.set(0, -2, 0);
      this.titleText.material.transparent = true;
      this.titleText.material.opacity = 0;
      
      this.scene.add(this.titleText);
      this.objects.push(this.titleText);
    });
    
    // Create "Brick by Brick" subtitle
    this.fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
      const subtitleGeometry = new TextGeometry('BRICK BY BRICK', {
        font: font,
        size: 0.4,
        height: 0.05,
        curveSegments: 8,
        bevelEnabled: false
      });
      
      subtitleGeometry.center();
      
      const subtitleMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.5,
        roughness: 0.5
      });
      
      this.subtitleText = new THREE.Mesh(subtitleGeometry, subtitleMaterial);
      this.subtitleText.position.set(0, -3, 0);
      this.subtitleText.material.transparent = true;
      this.subtitleText.material.opacity = 0;
      
      this.scene.add(this.subtitleText);
      this.objects.push(this.subtitleText);
    });
  }
  
  updateStage(elapsed) {
    // Calculate which stage we're in based on elapsed time
    let timeSum = 0;
    
    // Stage 1: Foundation appears
    if (elapsed < (timeSum += this.duration.foundation)) {
      const progress = elapsed / this.duration.foundation;
      return { stage: 1, progress };
    }
    
    // Stage 2: Bricks stack one by one
    if (elapsed < (timeSum += this.duration.stacking)) {
      const progress = (elapsed - (timeSum - this.duration.stacking)) / this.duration.stacking;
      return { stage: 2, progress };
    }
    
    // Stage 3: Completion/Final glow
    if (elapsed < (timeSum += this.duration.completion)) {
      const progress = (elapsed - (timeSum - this.duration.completion)) / this.duration.completion;
      return { stage: 3, progress };
    }
    
    // Loop back to beginning or stay at completion
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
        
      case 1: // Foundation appears
        this.animateFoundation(progress);
        break;
        
      case 2: // Bricks stack one by one
        this.animateStacking(progress);
        break;
        
      case 3: // Completion/Final glow
        this.animateCompletion(progress);
        break;
    }
    
    // Update any additional effects
    this.updateEffects(deltaTime);
  }
  
  resetAnimation() {
    // Reset foundation
    if (this.foundation) {
      this.foundation.material.opacity = 0;
    }
    
    // Reset all bricks
    this.bricks.forEach(brick => {
      brick.visible = false;
      brick.material.opacity = 0;
      brick.position.y = -5; // Below the scene
    });
    
    // Reset final brick glow
    if (this.finalBrickGlow) {
      this.finalBrickGlow.visible = false;
      this.finalBrickGlow.material.opacity = 0;
    }
    
    // Reset glow light
    if (this.finalGlow) {
      this.finalGlow.intensity = 0;
    }
    
    // Reset text
    if (this.titleText) {
      this.titleText.material.opacity = 0;
    }
    
    if (this.subtitleText) {
      this.subtitleText.material.opacity = 0;
    }
    
    this.stackedBricks = 0;
    this.animationComplete = false;
  }
  
  animateFoundation(progress) {
    // Fade in the foundation
    if (this.foundation) {
      this.foundation.material.opacity = progress;
    }
    
    // Fade in the title text
    if (this.titleText) {
      this.titleText.material.opacity = progress;
      this.titleText.position.y = -2.5 + progress * 0.5;
    }
    
    // Fade in the subtitle text
    if (this.subtitleText) {
      this.subtitleText.material.opacity = progress;
      this.subtitleText.position.y = -3 + progress * 0.5;
    }
  }
  
  animateStacking(progress) {
    // Calculate how many bricks should be visible/stacked
    const bricksToShow = Math.floor(progress * this.totalBricks);
    
    // Make sure title is fully visible
    if (this.titleText) {
      this.titleText.material.opacity = 1;
    }
    
    if (this.subtitleText) {
      this.subtitleText.material.opacity = 1;
    }
    
    // Animate each brick that should be shown
    for (let i = 0; i < this.totalBricks; i++) {
      const brick = this.bricks[i];
      
      // If this brick should be visible
      if (i < bricksToShow) {
        brick.visible = true;
        
        // Calculate individual brick progress
        const brickProgress = (progress * this.totalBricks) - i;
        
        // Animate brick if it's in transition
        if (brickProgress <= 1 && brickProgress > 0) {
          // Ease in-out function for smooth animation
          const easeProgress = this.easeInOutCubic(brickProgress);
          
          // Fade in the brick
          brick.material.opacity = easeProgress;
          
          // Animate position from below
          const startY = -3;
          const targetY = brick.userData.targetY;
          brick.position.y = startY + (targetY - startY) * easeProgress;
          
          // Slight wobble for more natural movement
          const wobble = Math.sin(brickProgress * Math.PI * 2) * 0.05 * (1 - brickProgress);
          brick.rotation.z = wobble;
        } 
        // If brick animation is complete
        else if (brickProgress > 1) {
          brick.material.opacity = 1;
          brick.position.y = brick.userData.targetY;
          
          // Reset rotation with slight variation
          if (!brick.userData.isFinal) {
            const angleVariation = 0.02;
            brick.rotation.z = (Math.random() - 0.5) * angleVariation;
          }
        }
      } else {
        brick.visible = false;
      }
    }
    
    // Update stacked bricks count for feedback
    this.stackedBricks = bricksToShow;
  }
  
  animateCompletion(progress) {
    // Ensure all bricks are properly placed
    for (let i = 0; i < this.totalBricks; i++) {
      const brick = this.bricks[i];
      brick.visible = true;
      brick.material.opacity = 1;
      brick.position.y = brick.userData.targetY;
    }
    
    // Get the final brick
    const finalBrick = this.bricks[this.totalBricks - 1];
    
    // Animate the final brick glow
    if (finalBrick && this.finalBrickGlow) {
      // Position the glow around the final brick
      this.finalBrickGlow.position.copy(finalBrick.position);
      this.finalBrickGlow.visible = true;
      
      // Increase the glow opacity over time
      this.finalBrickGlow.material.opacity = progress * 0.6;
      
      // Make the glow pulse
      const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.1 * progress;
      this.finalBrickGlow.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
    // Increase the intensity of the point light
    if (this.finalGlow) {
      this.finalGlow.position.copy(finalBrick.position);
      this.finalGlow.intensity = progress * 2;
    }
    
    // Animate the final brick pulsing emission
    if (finalBrick) {
      finalBrick.material.emissiveIntensity = 0.5 + Math.sin(progress * Math.PI * 6) * 0.3;
    }
    
    // Camera movement to showcase the final stack
    if (window.app && window.app.camera) {
      // Calculate a circular path for the camera
      const angle = progress * Math.PI * 2;
      const radius = 15 - progress * 3; // Camera gradually moves closer
      
      window.app.camera.position.x = Math.sin(angle) * radius;
      window.app.camera.position.z = Math.cos(angle) * radius;
      
      // Look at the final brick
      if (finalBrick) {
        window.app.camera.lookAt(finalBrick.position);
      }
    }
    
    // Animate title text
    if (this.titleText) {
      this.titleText.material.emissiveIntensity = 0.2 + progress * 0.4;
    }
    
    // Animation is complete when progress reaches 1
    if (progress >= 0.99 && !this.animationComplete) {
      this.animationComplete = true;
    }
  }
  
  updateEffects(deltaTime) {
    // Any continuous effects that need updating regardless of stage
    
    // Subtle rotation for the title
    if (this.titleText) {
      this.titleText.rotation.y = Math.sin(this.time * 0.5) * 0.05;
    }
    
    // Light color breathing effect
    if (this.finalGlow && this.finalGlow.intensity > 0) {
      const hue = (this.time * 0.1) % 1;
      const color = new THREE.Color().setHSL(hue, 1, 0.5);
      this.finalGlow.color = color;
    }
  }
  
  // Utility functions
  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
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
    this.bricks = [];
    
    // Reset camera if needed
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 0, 10);
      window.app.camera.lookAt(0, 0, 0);
    }
  }
}
