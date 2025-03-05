import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export class Animation6 {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.time = 0;
    this.duration = {
      intro: 2,       // Initial buildup
      explosion: 3,   // Document explosion
      dataStream: 5,  // Flowing data
      transform: 3,   // Transformation of secrets
      finale: 3       // Final scene fade
    };
    this.totalDuration = Object.values(this.duration).reduce((a, b) => a + b, 0);
    this.fontLoader = new FontLoader();
    
    // Particle systems
    this.documentParticles = [];
    this.dataStreamParticles = [];
    this.transformingObjects = [];
    
    // Color scheme
    this.colors = {
      documents: 0xffffff,
      financialData: 0x44ff88,
      secrets: 0xff3333,
      background: 0x090918
    };
  }
  
  init() {
    // Set camera position
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 0, 20);
    }
    
    // Set dark background
    this.scene.background = new THREE.Color(this.colors.background);
    
    // Create initial scene elements
    this.createDocuments();
    this.createDataElements();
    this.createSecretObjects();
    this.createTitle();
    
    // Add lighting
    this.setupLights();
  }
  
  setupLights() {
    // Dramatic lighting setup
    const ambientLight = new THREE.AmbientLight(0x333333, 2);
    this.scene.add(ambientLight);
    this.objects.push(ambientLight);
    
    // Main spotlight from above
    const spotlight = new THREE.SpotLight(0xffffff, 10, 50, Math.PI / 6, 0.5);
    spotlight.position.set(0, 15, 10);
    spotlight.castShadow = true;
    this.scene.add(spotlight);
    this.objects.push(spotlight);
    
    // Side rim lights for dramatic effect
    const rimLight1 = new THREE.PointLight(0x6644ff, 5, 20);
    rimLight1.position.set(-10, 5, 8);
    this.scene.add(rimLight1);
    this.objects.push(rimLight1);
    
    const rimLight2 = new THREE.PointLight(0xff4422, 5, 20);
    rimLight2.position.set(10, -5, 8);
    this.scene.add(rimLight2);
    this.objects.push(rimLight2);
  }
  
  createDocuments() {
    // Create a collection of document objects that will explode outward
    const documentGroup = new THREE.Group();
    
    // Generate 30 document objects
    for (let i = 0; i < 30; i++) {
      // Create a document (paper sheet)
      const width = 1 + Math.random() * 0.5;
      const height = 1.4 + Math.random() * 0.5;
      const geometry = new THREE.PlaneGeometry(width, height);
      
      // Randomly choose document type (white paper, financial, classified)
      let material;
      const docType = Math.floor(Math.random() * 3);
      
      if (docType === 0) {
        // Regular document
        material = new THREE.MeshStandardMaterial({
          color: 0xf0f0f0,
          roughness: 0.7,
          metalness: 0.1,
          side: THREE.DoubleSide
        });
      } else if (docType === 1) {
        // Financial document with grid pattern
        material = new THREE.MeshStandardMaterial({
          color: 0xeeffee,
          roughness: 0.7,
          metalness: 0.1,
          side: THREE.DoubleSide
        });
        
        // Add financial text texture later
      } else {
        // Classified/secret document with red markings
        material = new THREE.MeshStandardMaterial({
          color: 0xffeeee,
          roughness: 0.7,
          metalness: 0.1,
          emissive: 0xff0000,
          emissiveIntensity: 0.2,
          side: THREE.DoubleSide
        });
        
        // Add classified stamp texture later
      }
      
      const document = new THREE.Mesh(geometry, material);
      
      // All documents start at center, will explode outward
      document.position.set(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );
      
      // Random initial rotation
      document.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      // Store explosion velocity vector for animation
      document.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
      
      // Store rotation velocity for spinning documents
      document.userData.rotationVelocity = new THREE.Vector3(
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.1 - 0.05
      );
      
      // Initially invisible
      document.visible = false;
      
      documentGroup.add(document);
      this.documentParticles.push(document);
    }
    
    this.documents = documentGroup;
    this.scene.add(this.documents);
    this.objects.push(this.documents);
  }
  
  createDataElements() {
    // Create flowing data elements (numbers, charts, currency symbols)
    const dataGroup = new THREE.Group();
    
    // Generate 200 data particles
    for (let i = 0; i < 200; i++) {
      // Different types of data elements
      let geometry, material;
      const dataType = Math.floor(Math.random() * 5);
      
      switch (dataType) {
        case 0: // Currency symbol ($)
          geometry = new THREE.CircleGeometry(0.2, 16);
          material = new THREE.MeshStandardMaterial({
            color: this.colors.financialData,
            emissive: this.colors.financialData,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9
          });
          break;
        
        case 1: // Number cube
          geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
          material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
          });
          break;
        
        case 2: // Graph bar
          geometry = new THREE.BoxGeometry(0.1, 0.5 * Math.random() + 0.2, 0.1);
          material = new THREE.MeshStandardMaterial({
            color: 0x44aaff,
            transparent: true,
            opacity: 0.8
          });
          break;
          
        case 3: // Lock symbol
          geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.25, 16);
          material = new THREE.MeshStandardMaterial({
            color: 0xbbbbdd,
            metalness: 0.8,
            roughness: 0.2
          });
          break;
          
        default: // Small data point
          geometry = new THREE.SphereGeometry(0.08, 8, 8);
          material = new THREE.MeshStandardMaterial({
            color: 0xffffff * Math.random(),
            emissive: 0x444444,
            emissiveIntensity: 0.2
          });
      }
      
      const dataElement = new THREE.Mesh(geometry, material);
      
      // Initial position above screen, staggered start
      dataElement.position.set(
        (Math.random() - 0.5) * 20,
        20 + Math.random() * 30,
        (Math.random() - 0.5) * 10
      );
      
      // Store fall speed
      dataElement.userData.fallSpeed = 0.1 + Math.random() * 0.3;
      
      // Initially invisible
      dataElement.visible = false;
      
      dataGroup.add(dataElement);
      this.dataStreamParticles.push(dataElement);
    }
    
    this.dataStream = dataGroup;
    this.scene.add(this.dataStream);
    this.objects.push(this.dataStream);
  }
  
  createSecretObjects() {
    // Create objects that represent secrets (locks, folders, etc.)
    const secretsGroup = new THREE.Group();
    
    // Create 5 significant secret objects
    for (let i = 0; i < 5; i++) {
      // Create a secure folder/dossier
      const folderGeometry = new THREE.BoxGeometry(2, 1.5, 0.2);
      const folderMaterial = new THREE.MeshStandardMaterial({
        color: 0xaa3333,
        roughness: 0.5,
        metalness: 0.2
      });
      
      const folder = new THREE.Mesh(folderGeometry, folderMaterial);
      
      // Position in a pentagon arrangement
      const angle = (i / 5) * Math.PI * 2;
      folder.position.set(
        Math.cos(angle) * 8,
        Math.sin(angle) * 8,
        -5
      );
      
      // Tilt toward center
      folder.lookAt(0, 0, 0);
      folder.rotateX(Math.PI * 0.1);
      
      // Add lock emblem to folder
      const lockGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
      const lockMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        metalness: 0.9,
        roughness: 0.1
      });
      
      const lock = new THREE.Mesh(lockGeometry, lockMaterial);
      lock.rotation.x = Math.PI * 0.5;
      lock.position.set(0, 0, 0.15);
      folder.add(lock);
      
      // Add to transforming objects array for animation
      folder.userData = {
        originalScale: folder.scale.clone(),
        originalPosition: folder.position.clone(),
        originalRotation: folder.rotation.clone(),
        transformProgress: 0
      };
      
      // Initially invisible
      folder.visible = false;
      
      secretsGroup.add(folder);
      this.transformingObjects.push(folder);
    }
    
    this.secrets = secretsGroup;
    this.scene.add(this.secrets);
    this.objects.push(this.secrets);
  }
  
  createTitle() {
    // Create "Luanda Leaks" title text
    this.fontLoader.load('/fonts/helvetiker_bold.typeface.json', (font) => {
      const textGeometry = new TextGeometry('LUANDA LEAKS', {
        font: font,
        size: 2,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
      });
      
      textGeometry.center();
      
      const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xff0000,
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.3
      });
      
      this.titleText = new THREE.Mesh(textGeometry, textMaterial);
      this.titleText.position.set(0, -8, 0);
      this.titleText.visible = false;
      
      this.scene.add(this.titleText);
      this.objects.push(this.titleText);
    });
  }
  
  updateStage(elapsed) {
    // Calculate which animation stage we're in based on elapsed time
    let timeSum = 0;
    
    // Stage 1: Intro
    if (elapsed < (timeSum += this.duration.intro)) {
      const progress = elapsed / this.duration.intro;
      return { stage: 1, progress };
    }
    
    // Stage 2: Explosion
    if (elapsed < (timeSum += this.duration.explosion)) {
      const progress = (elapsed - (timeSum - this.duration.explosion)) / this.duration.explosion;
      return { stage: 2, progress };
    }
    
    // Stage 3: Data Stream
    if (elapsed < (timeSum += this.duration.dataStream)) {
      const progress = (elapsed - (timeSum - this.duration.dataStream)) / this.duration.dataStream;
      return { stage: 3, progress };
    }
    
    // Stage 4: Transform
    if (elapsed < (timeSum += this.duration.transform)) {
      const progress = (elapsed - (timeSum - this.duration.transform)) / this.duration.transform;
      return { stage: 4, progress };
    }
    
    // Stage 5: Finale
    if (elapsed < (timeSum += this.duration.finale)) {
      const progress = (elapsed - (timeSum - this.duration.finale)) / this.duration.finale;
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
        
      case 1: // Intro - Building tension
        this.animateIntro(progress);
        break;
        
      case 2: // Explosion - Documents burst out
        this.animateExplosion(progress);
        break;
        
      case 3: // Data Stream - Financial info flows
        this.animateDataStream(progress);
        break;
        
      case 4: // Transform - Secrets transform
        this.animateTransformation(progress);
        break;
        
      case 5: // Finale - Consequences shown
        this.animateFinale(progress);
        break;
    }
  }
  
  resetAnimation() {
    // Reset all documents
    this.documentParticles.forEach(doc => {
      doc.visible = false;
      doc.position.set(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );
      doc.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
    });
    
    // Reset data stream elements
    this.dataStreamParticles.forEach(data => {
      data.visible = false;
      data.position.set(
        (Math.random() - 0.5) * 20,
        20 + Math.random() * 30,
        (Math.random() - 0.5) * 10
      );
    });
    
    // Reset transforming objects
    this.transformingObjects.forEach(obj => {
      obj.visible = false;
      if (obj.userData.originalPosition) {
        obj.position.copy(obj.userData.originalPosition);
        obj.rotation.copy(obj.userData.originalRotation);
        obj.scale.copy(obj.userData.originalScale);
      }
      obj.userData.transformProgress = 0;
    });
    
    // Reset title
    if (this.titleText) {
      this.titleText.visible = false;
      this.titleText.position.y = -8;
    }
    
    // Reset camera if needed
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 0, 20);
    }
  }
  
  animateIntro(progress) {
    // Build tension before explosion
    
    // Slowly materialize some documents at the center
    this.documentParticles.forEach((doc, i) => {
      if (i < 5) { // Just show a few documents initially
        doc.visible = progress > 0.3;
        if (doc.visible) {
          doc.scale.set(progress, progress, progress);
          doc.position.z = -5 + progress * 5;
          doc.rotation.y = this.time * 0.5;
        }
      }
    });
    
    // Start showing title from the beginning
    if (this.titleText) {
      this.titleText.visible = true;
      // Move up from bottom
      this.titleText.position.y = -8 + progress * 5;
      // Add subtle rotation
      this.titleText.rotation.x = Math.sin(this.time * 2) * 0.05;
    }
    
    // Camera slowly moves forward
    if (window.app && window.app.camera) {
      window.app.camera.position.z = 20 - progress * 5;
    }
  }
  
  animateExplosion(progress) {
    // Documents explode outward
    
    this.documentParticles.forEach((doc, i) => {
      doc.visible = true;
      
      // Calculate explosion force based on progress
      const explosionForce = progress < 0.2 ? 
        progress * 5 : // Accelerating at first
        1 - (0.3 * (progress - 0.2)); // Then slightly slowing down
      
      // Move documents outward based on their velocity
      doc.position.x += doc.userData.velocity.x * explosionForce * 0.3;
      doc.position.y += doc.userData.velocity.y * explosionForce * 0.3;
      doc.position.z += doc.userData.velocity.z * explosionForce * 0.3;
      
      // Spin documents
      doc.rotation.x += doc.userData.rotationVelocity.x;
      doc.rotation.y += doc.userData.rotationVelocity.y;
      doc.rotation.z += doc.userData.rotationVelocity.z;
    });
    
    // Make title pulse with explosion
    if (this.titleText) {
      const pulse = 1 + Math.sin(progress * Math.PI * 2) * 0.2;
      this.titleText.scale.set(pulse, pulse, pulse);
      this.titleText.material.emissiveIntensity = 0.3 + progress * 0.7;
    }
    
    // Camera shake effect during explosion
    if (window.app && window.app.camera) {
      const shakeAmount = progress < 0.5 ? progress * 0.6 : (1 - progress) * 0.6;
      window.app.camera.position.x = (Math.random() - 0.5) * shakeAmount;
      window.app.camera.position.y = (Math.random() - 0.5) * shakeAmount;
    }
  }
  
  animateDataStream(progress) {
    // Financial data streams down the screen
    
    // Make documents fade and move to edges
    this.documentParticles.forEach((doc, i) => {
      if (doc.material.opacity !== undefined) {
        doc.material.opacity = 1 - progress * 0.8;
        doc.material.transparent = true;
      }
      
      // Move documents further outward and downward
      doc.position.y -= 0.02;
      doc.position.x *= 1.01;
      doc.position.z *= 1.01;
    });
    
    // Activate data streaming particles
    this.dataStreamParticles.forEach((data, i) => {
      data.visible = true;
      
      // Calculate when this particle should start falling (staggered)
      const startThreshold = i / this.dataStreamParticles.length;
      if (progress > startThreshold * 0.7) {
        // Move downward
        data.position.y -= data.userData.fallSpeed;
        
        // If it goes too far down, reset to top (creates continuous stream)
        if (data.position.y < -15) {
          data.position.y = 20;
          data.position.x = (Math.random() - 0.5) * 20;
        }
        
        // Slight swaying motion
        data.position.x += Math.sin(this.time * 2 + i) * 0.02;
        
        // Rotation effects
        data.rotation.x += 0.01;
        data.rotation.y += 0.02;
      }
    });
    
    // Reveal secrets in background
    if (progress > 0.5) {
      this.transformingObjects.forEach((obj, i) => {
        obj.visible = true;
        // Rotate slowly
        obj.rotation.y = obj.userData.originalRotation.y + this.time * 0.2;
      });
    }
    
    // Title continues to be visible but moves upward
    if (this.titleText) {
      this.titleText.position.y = -3 + progress * 2;
      this.titleText.material.emissiveIntensity = 1 - progress * 0.5;
    }
  }
  
  animateTransformation(progress) {
    // Secrets transform into broken/open states
    
    // Continue data stream but slow it down
    this.dataStreamParticles.forEach((data, i) => {
      data.position.y -= data.userData.fallSpeed * (1 - progress * 0.8);
      
      // Add turbulence/disruption
      const turbulence = progress * 0.2;
      data.position.x += (Math.random() - 0.5) * turbulence;
      data.position.z += (Math.random() - 0.5) * turbulence;
      
      // Some particles start breaking/glitching
      if (Math.random() < 0.01) {
        data.visible = !data.visible;
      }
    });
    
    // Transform the secret objects
    this.transformingObjects.forEach((obj, i) => {
      // Update transform progress
      obj.userData.transformProgress = Math.min(1, obj.userData.transformProgress + 0.01);
      const tProgress = obj.userData.transformProgress;
      
      // Move toward center
      obj.position.x *= 0.99;
      obj.position.y *= 0.99;
      
      // Break apart/transform
      if (progress > 0.3) {
        // Deform the objects
        const deformAmount = (progress - 0.3) * 1.4;
        obj.scale.x = obj.userData.originalScale.x * (1 + Math.sin(this.time * 3 + i) * deformAmount);
        obj.scale.y = obj.userData.originalScale.y * (1 + Math.cos(this.time * 4 + i) * deformAmount);
        
        // Change color to indicate breaking security
        if (obj.material) {
          obj.material.emissive = new THREE.Color(0xff0000);
          obj.material.emissiveIntensity = deformAmount;
        }
      }
    });
    
    // Title starts glitching/breaking apart
    if (this.titleText) {
      if (Math.random() < 0.1) {
        this.titleText.visible = !this.titleText.visible;
      }
      
      const glitchAmount = progress * 0.2;
      this.titleText.position.x = (Math.random() - 0.5) * glitchAmount;
      this.titleText.material.emissiveIntensity = 0.5 + Math.random() * 0.5;
    }
  }
  
  animateFinale(progress) {
    // Show the aftermath, fade to darkness
    
    // Slow down remaining movements
    this.dataStreamParticles.forEach((data, i) => {
      // Slow to a stop
      data.position.y -= data.userData.fallSpeed * (1 - progress * 0.95);
      
      // Fade out
      if (data.material.opacity !== undefined) {
        data.material.opacity = 1 - progress * 0.8;
        data.material.transparent = true;
      }
    });
    
    // Secret objects fall apart completely
    this.transformingObjects.forEach((obj) => {
      // Fade out
      if (obj.material) {
        if (obj.material.opacity === undefined) {
          obj.material.opacity = 1;
          obj.material.transparent = true;
        }
        obj.material.opacity = 1 - progress * 0.8;
      }
      
      // Fall downward
      obj.position.y -= progress * 0.1;
      
      // Spin slowly
      obj.rotation.x += 0.01;
      obj.rotation.z += 0.01;
    });
    
    // Title fades but stays visible
    if (this.titleText) {
      this.titleText.visible = true;
      this.titleText.position.y = -1 + progress * 2;
      this.titleText.material.opacity = 1 - progress * 0.5;
      this.titleText.material.transparent = true;
    }
    
    // Camera pulls back to show the aftermath
    if (window.app && window.app.camera) {
      window.app.camera.position.z = 15 + progress * 10;
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
    this.documentParticles = [];
    this.dataStreamParticles = [];
    this.transformingObjects = [];
    
    // Reset camera
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 0, 10);
    }
  }
}
