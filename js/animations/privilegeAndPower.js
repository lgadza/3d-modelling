import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export class Animation7 {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.time = 0;
    this.duration = {
      intro: 3,       // Initial balanced scale
      tipping: 4,     // Scale begins to tip
      imbalance: 5,   // Full imbalance demonstration
      chains: 4,      // Chains tightening
      finale: 3       // Final dramatic scene
    };
    this.totalDuration = Object.values(this.duration).reduce((a, b) => a + b, 0);
    this.fontLoader = new FontLoader();
    
    // Element groups
    this.wealthObjects = [];
    this.povertyObjects = [];
    this.chainLinks = [];
    this.sparkParticles = [];
    
    // Color scheme for visual impact
    this.colors = {
      gold: 0xD4AF37,
      silver: 0xC0C0C0,
      darkBlue: 0x0A1931,
      deepRed: 0x8B0000,
      background: 0x08080F
    };
    
    // Physics properties
    this.tiltAngle = 0;
    this.targetTiltAngle = 0;
    this.chainTightness = 0;
  }
  
  init() {
    // Set camera position
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 5, 18);
    }
    
    // Set dark moody background
    this.scene.background = new THREE.Color(this.colors.background);
    
    // Create the scale of justice
    this.createScaleOfJustice();
    
    // Create wealth objects (coins, diamonds, etc.)
    this.createWealthObjects();
    
    // Create poverty/broken system objects
    this.createBrokenSystemObjects();
    
    // Create chains for later animation
    this.createChains();
    
    // Create lighting
    this.setupLighting();
    
    // Create title text
    this.createTitle();
    
    // Set initial positions
    this.resetAnimation();
  }
  
  setupLighting() {
    // Dark, moody lighting with spotlights
    
    // Ambient light (dim)
    const ambientLight = new THREE.AmbientLight(0x222222, 1);
    this.scene.add(ambientLight);
    this.objects.push(ambientLight);
    
    // Main spotlight on scale
    const spotlight1 = new THREE.SpotLight(0xffffff, 15, 30, Math.PI / 6, 0.3);
    spotlight1.position.set(0, 15, 5);
    spotlight1.castShadow = true;
    spotlight1.shadow.bias = -0.0001;
    this.scene.add(spotlight1);
    this.objects.push(spotlight1);
    
    // Spotlight for wealth side with golden tint
    const spotlight2 = new THREE.SpotLight(0xffd700, 10, 20, Math.PI / 5, 0.5);
    spotlight2.position.set(-5, 10, 3);
    spotlight2.castShadow = true;
    this.scene.add(spotlight2);
    this.objects.push(spotlight2);
    
    // Red spotlight for poverty side
    const spotlight3 = new THREE.SpotLight(this.colors.deepRed, 8, 20, Math.PI / 5, 0.5);
    spotlight3.position.set(5, 8, 3);
    spotlight3.castShadow = true;
    this.scene.add(spotlight3);
    this.objects.push(spotlight3);
    
    // Blue rim light for dramatic effect
    const rimLight = new THREE.PointLight(this.colors.darkBlue, 5, 15);
    rimLight.position.set(0, -5, -10);
    this.scene.add(rimLight);
    this.objects.push(rimLight);
    
    // Fog for atmosphere
    this.scene.fog = new THREE.FogExp2(this.colors.background, 0.02);
  }
  
  createScaleOfJustice() {
    this.scaleGroup = new THREE.Group();
    
    // Create base/pedestal
    const baseGeometry = new THREE.CylinderGeometry(1, 1.5, 1, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.silver,
      metalness: 0.7,
      roughness: 0.3
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -5;
    base.castShadow = true;
    base.receiveShadow = true;
    this.scaleGroup.add(base);
    
    // Create pillar
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.5, 8, 16);
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.silver,
      metalness: 0.7,
      roughness: 0.3
    });
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar.position.y = -0.5;
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    this.scaleGroup.add(pillar);
    
    // Create crossbar
    const crossbarGeometry = new THREE.BoxGeometry(12, 0.4, 0.4);
    const crossbarMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.gold,
      metalness: 0.9,
      roughness: 0.1
    });
    this.crossbar = new THREE.Mesh(crossbarGeometry, crossbarMaterial);
    this.crossbar.position.y = 3.5;
    this.crossbar.castShadow = true;
    this.crossbar.receiveShadow = true;
    this.scaleGroup.add(this.crossbar);
    
    // Create left scale pan (wealth)
    const leftPanGeometry = new THREE.CylinderGeometry(2, 2, 0.2, 32);
    const leftPanMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.gold,
      metalness: 0.9,
      roughness: 0.1
    });
    this.leftPan = new THREE.Mesh(leftPanGeometry, leftPanMaterial);
    this.leftPan.position.set(-5, 2.5, 0);
    this.leftPan.castShadow = true;
    this.leftPan.receiveShadow = true;
    this.scaleGroup.add(this.leftPan);
    
    // Create right scale pan (poverty)
    const rightPanGeometry = new THREE.CylinderGeometry(2, 2, 0.2, 32);
    const rightPanMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.gold,
      metalness: 0.7,
      roughness: 0.3
    });
    this.rightPan = new THREE.Mesh(rightPanGeometry, rightPanMaterial);
    this.rightPan.position.set(5, 2.5, 0);
    this.rightPan.castShadow = true;
    this.rightPan.receiveShadow = true;
    this.scaleGroup.add(this.rightPan);
    
    // Create chains/ropes connecting pans to crossbar
    this.createChainConnections();
    
    // Add to scene
    this.scene.add(this.scaleGroup);
    this.objects.push(this.scaleGroup);
  }
  
  createChainConnections() {
    // Left side chains (3 chains)
    for (let i = 0; i < 3; i++) {
      const chainGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
      const chainMaterial = new THREE.MeshStandardMaterial({
        color: this.colors.silver,
        metalness: 0.8,
        roughness: 0.2
      });
      
      const chain = new THREE.Mesh(chainGeometry, chainMaterial);
      
      // Position evenly around the pan
      const angle = (i / 3) * Math.PI * 2;
      const radius = 1.5;
      chain.position.x = -5 + Math.cos(angle) * radius;
      chain.position.y = 3;
      chain.position.z = Math.sin(angle) * radius;
      
      chain.castShadow = true;
      
      this.scaleGroup.add(chain);
    }
    
    // Right side chains (3 chains)
    for (let i = 0; i < 3; i++) {
      const chainGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
      const chainMaterial = new THREE.MeshStandardMaterial({
        color: this.colors.silver,
        metalness: 0.8,
        roughness: 0.2
      });
      
      const chain = new THREE.Mesh(chainGeometry, chainMaterial);
      
      // Position evenly around the pan
      const angle = (i / 3) * Math.PI * 2;
      const radius = 1.5;
      chain.position.x = 5 + Math.cos(angle) * radius;
      chain.position.y = 3;
      chain.position.z = Math.sin(angle) * radius;
      
      chain.castShadow = true;
      
      this.scaleGroup.add(chain);
    }
  }
  
  createWealthObjects() {
    // Create wealth group
    this.wealthGroup = new THREE.Group();
    
    // Create gold coins
    for (let i = 0; i < 40; i++) {
      const coinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 24);
      const coinMaterial = new THREE.MeshStandardMaterial({
        color: this.colors.gold,
        metalness: 1.0,
        roughness: 0.1,
        emissive: 0xffcc00,
        emissiveIntensity: 0.2
      });
      
      const coin = new THREE.Mesh(coinGeometry, coinMaterial);
      
      // Random stacked positions
      coin.position.set(
        -5 + (Math.random() - 0.5) * 2,  // x
        2.6 + i * 0.05,                  // y
        (Math.random() - 0.5) * 2        // z
      );
      
      coin.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      coin.castShadow = true;
      this.wealthGroup.add(coin);
      this.wealthObjects.push(coin);
    }
    
    // Create diamonds
    for (let i = 0; i < 5; i++) {
      const diamondGeometry = new THREE.OctahedronGeometry(0.4, 0);
      const diamondMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.9,
        thickness: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      });
      
      const diamond = new THREE.Mesh(diamondGeometry, diamondMaterial);
      
      diamond.position.set(
        -5 + (Math.random() - 0.5) * 1.5,
        3.5 + i * 0.2,
        (Math.random() - 0.5) * 1.5
      );
      
      diamond.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      diamond.castShadow = true;
      this.wealthGroup.add(diamond);
      this.wealthObjects.push(diamond);
    }
    
    // Create cash stacks
    for (let i = 0; i < 3; i++) {
      const cashGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.6);
      const cashMaterial = new THREE.MeshStandardMaterial({
        color: 0x44aa44,
        roughness: 0.8,
        metalness: 0.1
      });
      
      const cash = new THREE.Mesh(cashGeometry, cashMaterial);
      
      cash.position.set(
        -5 + (Math.random() - 0.5) * 1.5,
        2.7 + i * 0.1,
        (Math.random() - 0.5) * 1.5
      );
      
      cash.rotation.set(
        0,
        Math.random() * Math.PI * 2,
        0
      );
      
      cash.castShadow = true;
      this.wealthGroup.add(cash);
      this.wealthObjects.push(cash);
    }
    
    // Money bag (iconic)
    const bagGeometry = new THREE.SphereGeometry(0.8, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7);
    const bagMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const moneyBag = new THREE.Mesh(bagGeometry, bagMaterial);
    moneyBag.position.set(-5, 3.2, 0);
    moneyBag.castShadow = true;
    this.wealthGroup.add(moneyBag);
    this.wealthObjects.push(moneyBag);
    
    // Add dollar sign on bag
    this.fontLoader.load('/fonts/helvetiker_bold.typeface.json', (font) => {
      const textGeometry = new TextGeometry('$', {
        font: font,
        size: 0.5,
        height: 0.1
      });
      textGeometry.center();
      const textMaterial = new THREE.MeshStandardMaterial({
        color: this.colors.gold,
        metalness: 0.8,
        roughness: 0.2
      });
      const dollarSign = new THREE.Mesh(textGeometry, textMaterial);
      dollarSign.position.set(-5, 3.2, 0.5);
      dollarSign.castShadow = true;
      this.wealthGroup.add(dollarSign);
    });
    
    // Hide wealth initially
    this.wealthGroup.visible = false;
    this.scene.add(this.wealthGroup);
    this.objects.push(this.wealthGroup);
  }
  
  createBrokenSystemObjects() {
    // Create poverty/broken system group
    this.povertyGroup = new THREE.Group();
    
    // Broken chains
    for (let i = 0; i < 6; i++) {
      const chainGeometry = new THREE.TorusGeometry(0.2, 0.06, 8, 16, Math.PI * 1.5);
      const chainMaterial = new THREE.MeshStandardMaterial({
        color: 0x777777,
        roughness: 0.7,
        metalness: 0.3
      });
      
      const chainLink = new THREE.Mesh(chainGeometry, chainMaterial);
      
      chainLink.position.set(
        5 + (Math.random() - 0.5) * 1.5,
        2.7 + i * 0.15,
        (Math.random() - 0.5) * 1.5
      );
      
      chainLink.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      chainLink.castShadow = true;
      this.povertyGroup.add(chainLink);
      this.povertyObjects.push(chainLink);
    }
    
    // Shattered glass pieces
    for (let i = 0; i < 10; i++) {
      const shardGeometry = new THREE.ConeGeometry(0.2, 0.5, 4);
      const shardMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xaaddff,
        metalness: 0.0,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 0.2,
        clearcoat: 1.0
      });
      
      const shard = new THREE.Mesh(shardGeometry, shardMaterial);
      
      shard.position.set(
        5 + (Math.random() - 0.5) * 1.7,
        2.6 + i * 0.05,
        (Math.random() - 0.5) * 1.7
      );
      
      shard.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      shard.castShadow = true;
      this.povertyGroup.add(shard);
      this.povertyObjects.push(shard);
    }
    
    // Crumbling concrete/stone pieces
    for (let i = 0; i < 15; i++) {
      const stoneGeometry = new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.2, 0);
      const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0x999999,
        roughness: 0.9,
        metalness: 0.1
      });
      
      const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
      
      stone.position.set(
        5 + (Math.random() - 0.5) * 1.5,
        2.6 + i * 0.1,
        (Math.random() - 0.5) * 1.5
      );
      
      stone.castShadow = true;
      this.povertyGroup.add(stone);
      this.povertyObjects.push(stone);
    }
    
    // Add broken scales symbol
    const brokenScaleGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.1);
    const brokenScaleMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.7,
      metalness: 0.3
    });
    const brokenScale = new THREE.Mesh(brokenScaleGeometry, brokenScaleMaterial);
    brokenScale.position.set(5, 3, 0);
    brokenScale.rotation.z = Math.PI * 0.1; // Slight tilt
    brokenScale.castShadow = true;
    
    // Create break in the middle
    const brokenScale2 = new THREE.Mesh(brokenScaleGeometry, brokenScaleMaterial);
    brokenScale2.position.set(5.6, 2.9, 0);
    brokenScale2.rotation.z = -Math.PI * 0.15; // Opposite tilt
    brokenScale2.castShadow = true;
    
    this.povertyGroup.add(brokenScale);
    this.povertyGroup.add(brokenScale2);
    this.povertyObjects.push(brokenScale);
    this.povertyObjects.push(brokenScale2);
    
    // Hide poverty objects initially
    this.povertyGroup.visible = false;
    this.scene.add(this.povertyGroup);
    this.objects.push(this.povertyGroup);
  }
  
  createChains() {
    // Create chain that will tighten around objects later
    this.chainGroup = new THREE.Group();
    
    const chainRadius = 3.5; // Radius of circle formed by chain
    const linkCount = 20; // Number of links in the chain
    
    for (let i = 0; i < linkCount; i++) {
      const angle = (i / linkCount) * Math.PI * 2;
      
      // Create a chain link (torus)
      const linkGeometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
      const linkMaterial = new THREE.MeshStandardMaterial({
        color: this.colors.silver,
        metalness: 0.8,
        roughness: 0.2
      });
      
      const link = new THREE.Mesh(linkGeometry, linkMaterial);
      
      // Position in a circle
      link.position.set(
        Math.cos(angle) * chainRadius,
        0,
        Math.sin(angle) * chainRadius
      );
      
      // Orient the link
      link.rotation.y = angle + Math.PI / 2;
      
      // Store initial position for animation
      link.userData.initialRadius = chainRadius;
      link.userData.angle = angle;
      
      link.castShadow = true;
      this.chainGroup.add(link);
      this.chainLinks.push(link);
    }
    
    // Add glow effect to chains
    const chainGlow = new THREE.PointLight(this.colors.deepRed, 2, 5);
    chainGlow.position.set(0, 0, 0);
    this.chainGroup.add(chainGlow);
    
    // Position chain group
    this.chainGroup.position.y = -2;
    this.chainGroup.visible = false;
    
    this.scene.add(this.chainGroup);
    this.objects.push(this.chainGroup);
  }
  
  createTitle() {
    // Create title text
    this.fontLoader.load('/fonts/helvetiker_bold.typeface.json', (font) => {
      const textGeometry = new TextGeometry('PRIVILEGE & POWER', {
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
        color: this.colors.gold,
        metalness: 0.8,
        roughness: 0.2,
        emissive: this.colors.gold,
        emissiveIntensity: 0.2
      });
      
      this.titleText = new THREE.Mesh(textGeometry, textMaterial);
      this.titleText.position.set(0, -6, 0);
      this.titleText.castShadow = true;
      
      this.scene.add(this.titleText);
      this.objects.push(this.titleText);
    });
  }
  
  createSparks(position, count = 10) {
    // Create spark particles at position
    const sparkGroup = new THREE.Group();
    
    for (let i = 0; i < count; i++) {
      const sparkGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const sparkMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffaa,
        transparent: true,
        opacity: 1
      });
      
      const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
      
      // Random initial direction
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI * 2;
      
      spark.position.copy(position);
      
      // Store velocity for animation
      spark.userData.velocity = new THREE.Vector3(
        Math.cos(angle1) * Math.sin(angle2),
        Math.sin(angle1) * Math.sin(angle2),
        Math.cos(angle2)
      ).multiplyScalar(0.1 + Math.random() * 0.1);
      
      spark.userData.life = 1.0; // Life value from 1 to 0
      
      sparkGroup.add(spark);
      this.sparkParticles.push(spark);
    }
    
    this.scene.add(sparkGroup);
    this.objects.push(sparkGroup);
    
    return sparkGroup;
  }
  
  updateStage(elapsed) {
    // Calculate which stage we're in based on elapsed time
    let timeSum = 0;
    
    // Stage 1: Introduction - balanced scale
    if (elapsed < (timeSum += this.duration.intro)) {
      const progress = elapsed / this.duration.intro;
      return { stage: 1, progress };
    }
    
    // Stage 2: Tipping - scale begins to tip
    if (elapsed < (timeSum += this.duration.tipping)) {
      const progress = (elapsed - (timeSum - this.duration.tipping)) / this.duration.tipping;
      return { stage: 2, progress };
    }
    
    // Stage 3: Imbalance - full imbalance demonstration
    if (elapsed < (timeSum += this.duration.imbalance)) {
      const progress = (elapsed - (timeSum - this.duration.imbalance)) / this.duration.imbalance;
      return { stage: 3, progress };
    }
    
    // Stage 4: Chains - chains tightening
    if (elapsed < (timeSum += this.duration.chains)) {
      const progress = (elapsed - (timeSum - this.duration.chains)) / this.duration.chains;
      return { stage: 4, progress };
    }
    
    // Stage 5: Finale - final dramatic scene
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
        
      case 1: // Introduction - Balanced scale
        this.animateIntroduction(progress);
        break;
        
      case 2: // Tipping - Scale begins to tip
        this.animateTipping(progress);
        break;
        
      case 3: // Imbalance - Full imbalance demonstration
        this.animateImbalance(progress);
        break;
        
      case 4: // Chains - Chains tightening
        this.animateChains(progress);
        break;
        
      case 5: // Finale - Final dramatic scene
        this.animateFinale(progress);
        break;
    }
    
    // Update spark particles
    this.updateParticles(deltaTime);
  }
  
  resetAnimation() {
    // Reset scale of justice
    this.crossbar.rotation.z = 0;
    this.tiltAngle = 0;
    this.targetTiltAngle = 0;
    
    // Reset scale pan positions
    this.leftPan.position.set(-5, 2.5, 0);
    this.rightPan.position.set(5, 2.5, 0);
    
    // Reset wealth objects
    this.wealthGroup.visible = false;
    this.wealthObjects.forEach(obj => {
      obj.userData.originalPosition = obj.position.clone();
      obj.userData.originalRotation = obj.rotation.clone();
    });
    
    // Reset poverty objects
    this.povertyGroup.visible = false;
    this.povertyObjects.forEach(obj => {
      obj.userData.originalPosition = obj.position.clone();
      obj.userData.originalRotation = obj.rotation.clone();
    });
    
    // Reset chains
    this.chainGroup.visible = false;
    this.chainTightness = 0;
    this.chainLinks.forEach(link => {
      const angle = link.userData.angle;
      const radius = link.userData.initialRadius;
      link.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
    });
    
    // Clear spark particles
    for (let i = this.sparkParticles.length - 1; i >= 0; i--) {
      const spark = this.sparkParticles[i];
      if (spark.parent) spark.parent.remove(spark);
      this.sparkParticles.splice(i, 1);
    }
    
    // Reset camera
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 5, 18);
    }
  }
  
  animateIntroduction(progress) {
    // Show and bring in the scale
    this.scaleGroup.visible = true;
    this.scaleGroup.position.y = -5 + progress * 5;
    
    // Slight scale balance adjustment to show balance
    this.crossbar.rotation.z = Math.sin(this.time * 2) * 0.02;
    
    // Update pan positions based on crossbar rotation
    this.updatePanPositions();
    
    // At the end of intro, show wealth and poverty objects
    if (progress > 0.8) {
      this.wealthGroup.visible = true;
      this.povertyGroup.visible = true;
      
      const fadeIn = (progress - 0.8) * 5;
      
      // Fade in wealth objects
      this.wealthObjects.forEach((obj, i) => {
        obj.scale.set(fadeIn, fadeIn, fadeIn);
      });
      
      // Fade in poverty objects
      this.povertyObjects.forEach((obj, i) => {
        obj.scale.set(fadeIn, fadeIn, fadeIn);
      });
    }
    
    // Title rises from bottom
    if (this.titleText) {
      this.titleText.position.y = -6 + progress * 3;
    }
  }
  
  animateTipping(progress) {
    // Scale begins to tip toward wealth side
    this.targetTiltAngle = progress * -0.6; // Negative tilts toward wealth (left)
    this.tiltAngle += (this.targetTiltAngle - this.tiltAngle) * 0.05;
    this.crossbar.rotation.z = this.tiltAngle;
    
    // Update pan positions based on crossbar rotation
    this.updatePanPositions();
    
    // Wealth objects pile up and grow
    this.wealthGroup.visible = true;
    this.wealthObjects.forEach((obj, i) => {
      // Add slight upward motion to simulate piling up
      if (obj.position.y < obj.userData.originalPosition.y + 1.5) {
        obj.position.y += 0.01;
      }
      
      // Scale objects to appear more dominant
      const growFactor = 1 + progress * 0.3;
      obj.scale.set(growFactor, growFactor, growFactor);
      
      // Add slight rotation for dynamic effect
      obj.rotation.y += 0.01;
    });
    
    // Poverty objects decrease and fall slightly
    this.povertyGroup.visible = true;
    this.povertyObjects.forEach((obj, i) => {
      // Move objects downward
      obj.position.y -= 0.01 * progress;
      
      // Scale objects to appear diminished
      const shrinkFactor = 1 - progress * 0.3;
      obj.scale.set(shrinkFactor, shrinkFactor, shrinkFactor);
    });
    
    // Title glows more intensely
    if (this.titleText) {
      this.titleText.material.emissiveIntensity = 0.2 + progress * 0.3;
    }
    
    // Camera moves to show tipping scale better
    if (window.app && window.app.camera) {
      const cameraPosX = progress * 3;
      window.app.camera.position.x = cameraPosX;
    }
    
    // Create occasional sparks at friction points
    if (Math.random() < 0.05) {
      const sparkPos = new THREE.Vector3(
        -5 + (Math.random() - 0.5),
        3 + (Math.random() - 0.5),
        (Math.random() - 0.5)
      );
      this.createSparks(sparkPos, 5);
    }
  }
  
  animateImbalance(progress) {
    // Scale fully imbalanced
    this.targetTiltAngle = -0.8 - progress * 0.2; // Continue tilting further
    this.tiltAngle += (this.targetTiltAngle - this.tiltAngle) * 0.1;
    this.crossbar.rotation.z = this.tiltAngle;
    
    // Update pan positions
    this.updatePanPositions();
    
    // Wealth side is overloaded with objects
    this.wealthObjects.forEach((obj, i) => {
      // More dramatic movements
      obj.position.y = obj.userData.originalPosition.y + 1.5 + Math.sin(this.time * 2 + i) * 0.1;
      
      // Glowing effect on gold objects
      if (obj.material && obj.material.emissive) {
        obj.material.emissiveIntensity = 0.2 + Math.sin(this.time * 3) * 0.1;
      }
      
      // Continue rotation
      obj.rotation.y += 0.02;
    });
    
    // Poverty side objects fall off or break apart
    this.povertyObjects.forEach((obj, i) => {
      if (progress > i / this.povertyObjects.length * 0.8) {
        // Objects fall off at staggered times
        obj.position.y -= 0.05;
        obj.rotation.x += 0.02;
        obj.rotation.z += 0.01;
        
        // If object falls too far, reset it with a new random position
        if (obj.position.y < -10) {
          obj.position.y = 2.5 + Math.random();
          obj.position.x = 5 + (Math.random() - 0.5) * 2;
          obj.position.z = (Math.random() - 0.5) * 2;
          
          // Create spark effect at reset position
          this.createSparks(obj.position, 3);
        }
      }
    });
    
    // More dramatic camera movement
    if (window.app && window.app.camera) {
      // Camera circles around the scene
      const angle = this.time * 0.2;
      const radius = 18 - progress * 3; // Move closer as we progress
      window.app.camera.position.x = Math.sin(angle) * radius;
      window.app.camera.position.z = Math.cos(angle) * radius;
      window.app.camera.lookAt(0, 0, 0);
    }
    
    // Show title more prominently
    if (this.titleText) {
      // Make title pulse
      const pulse = 1 + Math.sin(this.time * 3) * 0.1;
      this.titleText.scale.set(pulse, pulse, pulse);
      this.titleText.material.emissiveIntensity = 0.5;
    }
  }
  
  animateChains(progress) {
    // Show the chain
    this.chainGroup.visible = true;
    
    // Move chain group upward to center of scene
    this.chainGroup.position.y = -2 + progress * 2;
    
    // Tighten the chains (reduce radius)
    this.chainTightness = progress * 0.8;
    this.chainLinks.forEach(link => {
      const angle = link.userData.angle;
      const radius = link.userData.initialRadius * (1 - this.chainTightness);
      
      // Update link positions
      link.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
      
      // Rotate links for dynamic effect
      link.rotation.x += 0.01;
      link.rotation.y = angle + Math.PI / 2; // Keep orientation consistent
    });
    
    // Create sparks at chain connection points
    if (Math.random() < 0.1) {
      const randomAngle = Math.random() * Math.PI * 2;
      const radius = link.userData.initialRadius * (1 - this.chainTightness);
      const sparkPos = new THREE.Vector3(
        Math.cos(randomAngle) * radius,
        this.chainGroup.position.y,
        Math.sin(randomAngle) * radius
      );
      this.createSparks(sparkPos, 3);
    }
    
    // Scale continues extreme tilt
    this.crossbar.rotation.z = this.targetTiltAngle;
    
    // Update pan positions for continuity
    this.updatePanPositions();
    
    // Camera moves to focus on chains
    if (window.app && window.app.camera) {
      const targetY = 0;
      const targetZ = 15;
      window.app.camera.position.y += (targetY - window.app.camera.position.y) * 0.05;
      window.app.camera.position.z += (targetZ - window.app.camera.position.z) * 0.05;
      window.app.camera.lookAt(0, 0, 0);
    }
    
    // Title text moves toward top of screen
    if (this.titleText) {
      this.titleText.position.y = -3 + progress * 6;
    }
  }
  
  animateFinale(progress) {
    // Final dramatic scene
    
    // Continue chain tightening to maximum
    this.chainLinks.forEach(link => {
      const angle = link.userData.angle;
      const finalRadius = link.userData.initialRadius * 0.1; // Very tight
      
      // Update link positions
      link.position.set(
        Math.cos(angle) * finalRadius,
        0,
        Math.sin(angle) * finalRadius
      );
      
      // Create pulse effect
      const pulse = 1 + Math.sin(this.time * 10) * 0.1;
      link.scale.set(pulse, pulse, pulse);
    });
    
    // Chain group glows red hot
    const glow = this.chainGroup.children.find(c => c instanceof THREE.PointLight);
    if (glow) {
      glow.intensity = 2 + progress * 8;
      glow.distance = 5 + progress * 10;
    }
    
    // Camera pulls back to reveal full scene
    if (window.app && window.app.camera) {
      const finalZ = 25;
      window.app.camera.position.z += (finalZ - window.app.camera.position.z) * 0.05;
      window.app.camera.position.y = 5 - progress * 2;
      window.app.camera.lookAt(0, 0, 0);
    }
    
    // Create burst of sparks in finale
    if (progress > 0.8 && Math.random() < 0.3) {
      const sparkPos = new THREE.Vector3(0, 0, 0);
      this.createSparks(sparkPos, 20);
    }
    
    // Title reaches final position at top of screen
    if (this.titleText) {
      this.titleText.position.y = 3 + Math.sin(this.time * 2) * 0.1;
      this.titleText.material.emissiveIntensity = 0.5 + Math.sin(this.time * 5) * 0.5;
    }
    
    // Fade effect at the very end
    if (progress > 0.9) {
      // Add vignette effect by adjusting fog density
      this.scene.fog.density = 0.02 + (progress - 0.9) * 10 * 0.05;
    }
  }
  
  updatePanPositions() {
    // Update scale pan positions based on crossbar tilt
    const leftPanOffset = Math.sin(this.crossbar.rotation.z) * 5;
    const rightPanOffset = -Math.sin(this.crossbar.rotation.z) * 5;
    
    this.leftPan.position.y = 2.5 + leftPanOffset;
    this.rightPan.position.y = 2.5 + rightPanOffset;
    
    // Update wealth group position to follow left pan
    this.wealthGroup.position.y = leftPanOffset;
    
    // Update poverty group position to follow right pan
    this.povertyGroup.position.y = rightPanOffset;
  }
  
  updateParticles(deltaTime) {
    // Update all spark particles
    for (let i = this.sparkParticles.length - 1; i >= 0; i--) {
      const spark = this.sparkParticles[i];
      
      // Move spark according to velocity
      spark.position.add(spark.userData.velocity);
      
      // Gravity effect
      spark.userData.velocity.y -= 0.01;
      
      // Reduce life
      spark.userData.life -= deltaTime * 2;
      
      // Update size and opacity based on life
      const scale = spark.userData.life * 0.5;
      spark.scale.set(scale, scale, scale);
      
      if (spark.material) {
        spark.material.opacity = spark.userData.life;
      }
      
      // Remove dead sparks
      if (spark.userData.life <= 0) {
        if (spark.parent) spark.parent.remove(spark);
        this.sparkParticles.splice(i, 1);
      }
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
    this.wealthObjects = [];
    this.povertyObjects = [];
    this.chainLinks = [];
    this.sparkParticles = [];
    
    // Reset camera
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 0, 10);
    }
    
    // Clear fog
    this.scene.fog = null;
  }
}