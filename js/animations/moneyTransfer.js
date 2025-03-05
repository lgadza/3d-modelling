import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export class Animation5 {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.time = 0;
    this.animationState = 0; // Controls the animation sequence
    this.duration = {
      intro: 2,     // Duration for intro scene
      moveStart: 3, // Duration for movement starts 
      journey: 5,   // Duration for money journey
      arrival: 3,   // Duration for arrival at bank
      complete: 3   // Duration for completion
    };
    this.totalDuration = Object.values(this.duration).reduce((a, b) => a + b, 0);
    this.fontLoader = new FontLoader();
  }
  
  init() {
    // Set camera position
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 0, 15);
    }
    
    // Create the scene elements
    this.createPhone();
    this.createMoney();
    this.createBank();
    this.createTransferPath(); // Removed particles
    this.createTextElements();
    
    // Initialize positions
    this.phone.position.set(-5, 0, 0);
    this.money.position.set(-5, 1, 0);
    this.money.scale.set(0.01, 0.01, 0.01); // Start small
    this.bank.position.set(5, 0, 0);
    this.bank.scale.set(0.01, 0.01, 0.01); // Start small
    
    // Hide bank initially
    this.bank.visible = false;
    
    // Add ambient and point lights for better scene lighting
    this.ambientLight = new THREE.AmbientLight(0x404040, 2);
    this.scene.add(this.ambientLight);
    this.objects.push(this.ambientLight);
    
    this.pointLight1 = new THREE.PointLight(0x6699ff, 10, 20);
    this.pointLight1.position.set(-3, 2, 5);
    this.scene.add(this.pointLight1);
    this.objects.push(this.pointLight1);
    
    this.pointLight2 = new THREE.PointLight(0x44ff88, 10, 20);
    this.pointLight2.position.set(3, -2, 5);
    this.scene.add(this.pointLight2);
    this.objects.push(this.pointLight2);
    
    // Background setup
    this.scene.background = new THREE.Color(0x0a0a14);
  }
  
  createPhone() {
    // Create a smartphone
    const phoneGroup = new THREE.Group();
    
    // Phone body
    const phoneGeometry = new THREE.BoxGeometry(1.5, 3, 0.1);
    const phoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.9,
      roughness: 0.1
    });
    const phoneBody = new THREE.Mesh(phoneGeometry, phoneMaterial);
    phoneGroup.add(phoneBody);
    
    // Phone screen
    const screenGeometry = new THREE.BoxGeometry(1.3, 2.7, 0.11);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      emissive: 0x1155aa,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1
    });
    const phoneScreen = new THREE.Mesh(screenGeometry, screenMaterial);
    phoneScreen.position.z = 0.01;
    phoneGroup.add(phoneScreen);
    
    // Banking app UI (simplified)
    const uiGeometry = new THREE.PlaneGeometry(1.1, 2.5);
    const uiMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
    const ui = new THREE.Mesh(uiGeometry, uiMaterial);
    ui.position.z = 0.06;
    phoneGroup.add(ui);
    
    // App elements - Header
    const headerGeometry = new THREE.PlaneGeometry(1.1, 0.3);
    const headerMaterial = new THREE.MeshBasicMaterial({
      color: 0x2266cc
    });
    const header = new THREE.Mesh(headerGeometry, headerMaterial);
    header.position.z = 0.07;
    header.position.y = 1.0;
    phoneGroup.add(header);
    
    // Balance amount
    const balanceGeometry = new THREE.PlaneGeometry(0.8, 0.2);
    const balanceMaterial = new THREE.MeshBasicMaterial({
      color: 0x44cc88
    });
    const balance = new THREE.Mesh(balanceGeometry, balanceMaterial);
    balance.position.z = 0.07;
    balance.position.y = 0.5;
    phoneGroup.add(balance);
    
    // Transfer button
    const buttonGeometry = new THREE.PlaneGeometry(0.8, 0.3);
    const buttonMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5533
    });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.z = 0.07;
    button.position.y = -0.3;
    phoneGroup.add(button);
    
    this.phone = phoneGroup;
    this.scene.add(this.phone);
    this.objects.push(this.phone);
  }
  
  createMoney() {
    // Create a stack of dollar bills
    const moneyGroup = new THREE.Group();
    
    // Create multiple bills stacked on top of each other
    const billCount = 7;
    for (let i = 0; i < billCount; i++) {
      // Create a dollar bill
      const billGeometry = new THREE.BoxGeometry(1.2, 0.5, 0.01);
      const billMaterial = new THREE.MeshStandardMaterial({
        color: 0xecf0e1, // Slightly off-white for dollar bill color
        metalness: 0.1,
        roughness: 0.6
      });
      const bill = new THREE.Mesh(billGeometry, billMaterial);
      
      // Add slight variation in position for stack effect
      bill.position.z = 0.01 * i;
      bill.position.x = (Math.random() - 0.5) * 0.05;
      bill.position.y = (Math.random() - 0.5) * 0.05;
      bill.rotation.z = (Math.random() - 0.5) * 0.1;
      
      moneyGroup.add(bill);
      
      // Add green decoration to bills
      const borderGeometry = new THREE.RingGeometry(0.15, 0.2, 32);
      const borderMaterial = new THREE.MeshBasicMaterial({
        color: 0x106630,
        side: THREE.DoubleSide
      });
      
      // Add two circles on the bill
      for (let j = 0; j < 2; j++) {
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.z = 0.011 + 0.01 * i;
        border.position.x = j === 0 ? -0.35 : 0.35;
        moneyGroup.add(border);
      }
      
      // Add horizontal line details
      for (let j = 0; j < 3; j++) {
        const lineGeometry = new THREE.PlaneGeometry(0.6, 0.03);
        const lineMaterial = new THREE.MeshBasicMaterial({
          color: 0x106630
        });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.z = 0.011 + 0.01 * i;
        line.position.y = -0.1 + j * 0.1;
        moneyGroup.add(line);
      }
    }
    
    // Add a "$" dollar sign on top
    this.fontLoader.load('/fonts/helvetiker_bold.typeface.json', (font) => {
      const textGeometry = new TextGeometry('$', {
        font: font,
        size: 0.4,
        height: 0.02
      });
      textGeometry.center();
      const textMaterial = new THREE.MeshStandardMaterial({
        color: 0x106630,
        emissive: 0x106630,
        emissiveIntensity: 0.3
      });
      const dollarSign = new THREE.Mesh(textGeometry, textMaterial);
      dollarSign.position.z = 0.1;
      moneyGroup.add(dollarSign);
    });
    
    // Glowing outline for the money
    const glowGeometry = new THREE.BoxGeometry(1.4, 0.7, 0.3);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x88ff99,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    moneyGroup.add(glow);
    
    this.money = moneyGroup;
    this.scene.add(this.money);
    this.objects.push(this.money);
  }
  
  createBank() {
    // Create a bank building
    const bankGroup = new THREE.Group();
    
    // Main bank building
    const buildingGeometry = new THREE.BoxGeometry(2, 2, 1);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 0.5,
      roughness: 0.5
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    bankGroup.add(building);
    
    // Bank roof
    const roofGeometry = new THREE.ConeGeometry(1.5, 1, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.5,
      roughness: 0.5
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 1.5;
    roof.rotation.y = Math.PI / 4;
    bankGroup.add(roof);
    
    // Bank columns
    for (let i = 0; i < 4; i++) {
      const columnGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.6, 16);
      const columnMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.7
      });
      const column = new THREE.Mesh(columnGeometry, columnMaterial);
      column.position.set(
        i < 2 ? -0.8 : 0.8,
        -0.2,
        i % 2 === 0 ? -0.6 : 0.6
      );
      bankGroup.add(column);
    }
    
    // Bank steps
    const stepsGeometry = new THREE.BoxGeometry(2.4, 0.2, 1.2);
    const stepsMaterial = new THREE.MeshStandardMaterial({
      color: 0x999999,
      metalness: 0.3,
      roughness: 0.7
    });
    const steps = new THREE.Mesh(stepsGeometry, stepsMaterial);
    steps.position.y = -1;
    steps.position.z = 0.1;
    bankGroup.add(steps);
    
    // Bank glow
    const glowGeometry = new THREE.BoxGeometry(2.4, 2.4, 1.4);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x5588ff,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    bankGroup.add(glow);
    
    this.bank = bankGroup;
    this.scene.add(this.bank);
    this.objects.push(this.bank);
  }
  
  createTransferPath() {
    // Create a visible path for the money transfer (curve)
    this.transferCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-5, 1, 0), // Start at phone
      new THREE.Vector3(-2, 3, 0), // Control point 1
      new THREE.Vector3(2, 3, 0),  // Control point 2
      new THREE.Vector3(5, 0, 0)   // End at bank
    );
    
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(
      this.transferCurve.getPoints(50)
    );
    
    const pathMaterial = new THREE.LineBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.0 // Start invisible
    });
    
    this.transferPath = new THREE.Line(pathGeometry, pathMaterial);
    this.scene.add(this.transferPath);
    this.objects.push(this.transferPath);
  }
  
  createTextElements() {
    // Create text for "$38 Million" and "Transaction Complete"
    this.fontLoader.load('/fonts/helvetiker_bold.typeface.json', (font) => {
      // Amount text
      const amountGeometry = new TextGeometry('$38 Million', {
        font: font,
        size: 0.4,
        height: 0.1
      });
      const amountMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.5
      });
      this.amountText = new THREE.Mesh(amountGeometry, amountMaterial);
      this.amountText.position.set(-6.5, 2, 0);
      this.amountText.visible = false;
      this.scene.add(this.amountText);
      this.objects.push(this.amountText);
      
      // Completion text
      const completeGeometry = new TextGeometry('Transaction Complete', {
        font: font,
        size: 0.5,
        height: 0.1
      });
      completeGeometry.center();
      const completeMaterial = new THREE.MeshStandardMaterial({
        color: 0x44ff44,
        emissive: 0x44ff44,
        emissiveIntensity: 0.5
      });
      this.completeText = new THREE.Mesh(completeGeometry, completeMaterial);
      this.completeText.position.set(0, 3, 0);
      this.completeText.visible = false;
      this.scene.add(this.completeText);
      this.objects.push(this.completeText);
    });
    
    // Binary particles creation removed
  }
  
  updateStage(elapsed) {
    // Calculate which stage we're in based on elapsed time
    let timeSum = 0;
    
    // Stage 1: Introduction
    if (elapsed < (timeSum += this.duration.intro)) {
      const progress = elapsed / this.duration.intro;
      return { stage: 1, progress };
    }
    
    // Stage 2: Movement Initiates
    if (elapsed < (timeSum += this.duration.moveStart)) {
      const progress = (elapsed - (timeSum - this.duration.moveStart)) / this.duration.moveStart;
      return { stage: 2, progress };
    }
    
    // Stage 3: Transfer Process
    if (elapsed < (timeSum += this.duration.journey)) {
      const progress = (elapsed - (timeSum - this.duration.journey)) / this.duration.journey;
      return { stage: 3, progress };
    }
    
    // Stage 4: Arrival
    if (elapsed < (timeSum += this.duration.arrival)) {
      const progress = (elapsed - (timeSum - this.duration.arrival)) / this.duration.arrival;
      return { stage: 4, progress };
    }
    
    // Stage 5: Completion
    if (elapsed < (timeSum += this.duration.complete)) {
      const progress = (elapsed - (timeSum - this.duration.complete)) / this.duration.complete;
      return { stage: 5, progress };
    }
    
    // Loop back to beginning
    return { stage: 0, progress: 0 };
  }
  
  update() {
    this.time += 0.016; // Approx 60fps
    
    const elapsed = this.time % this.totalDuration;
    const { stage, progress } = this.updateStage(elapsed);
    
    // Animation sequences based on stage
    switch (stage) {
      case 0: // Reset
        this.resetAnimation();
        break;
        
      case 1: // Introduction - The Phone with Money
        this.animateIntroduction(progress);
        break;
        
      case 2: // Movement Initiates - The Transfer Begins
        this.animateTransferBegins(progress);
        break;
        
      case 3: // Transfer Process - The Journey of Money
        this.animateMoneyJourney(progress);
        break;
        
      case 4: // Arrival - The Money Reaches the Bank
        this.animateArrival(progress);
        break;
        
      case 5: // Completion - Successful Transaction
        this.animateCompletion(progress);
        break;
    }
    
    // Binary particles update removed
  }
  
  resetAnimation() {
    // Reset all objects to initial state
    this.phone.position.set(-5, 0, 0);
    this.money.position.set(-5, 1, 0);
    this.money.scale.set(0.01, 0.01, 0.01);
    this.money.visible = true;
    this.bank.position.set(5, 0, 0);
    this.bank.scale.set(0.01, 0.01, 0.01);
    this.bank.visible = false;
    
    if (this.amountText) this.amountText.visible = false;
    if (this.completeText) this.completeText.visible = false;
    
    this.transferPath.material.opacity = 0;
  }
  
  animateIntroduction(progress) {
    // Phone scales up
    this.phone.scale.set(
      Math.min(1, progress * 2),
      Math.min(1, progress * 2),
      Math.min(1, progress * 2)
    );
    
    // Money appears after phone
    if (progress > 0.5) {
      const moneyProgress = (progress - 0.5) * 2;
      this.money.scale.set(
        Math.min(1, moneyProgress * 2),
        Math.min(1, moneyProgress * 2),
        Math.min(1, moneyProgress * 2)
      );
    }
    
    // Show amount text near end
    if (this.amountText && progress > 0.7) {
      this.amountText.visible = true;
      this.amountText.position.y = 2 + Math.sin(this.time * 2) * 0.05; // Gentle float
    }
  }
  
  animateTransferBegins(progress) {
    // Money floats up from phone
    this.money.position.y = 1 + progress * 1.5;
    
    // Money rotates
    this.money.rotation.y = progress * Math.PI;
    
    // Transfer path starts to appear
    this.transferPath.material.opacity = progress * 0.6;
    
    // Bank begins to appear
    if (progress > 0.7) {
      this.bank.visible = true;
      const bankProgress = (progress - 0.7) * 3.33;
      this.bank.scale.set(
        Math.min(1, bankProgress),
        Math.min(1, bankProgress),
        Math.min(1, bankProgress)
      );
    }
    
    // Keep amount text visible with gentle float
    if (this.amountText) {
      this.amountText.visible = true;
      this.amountText.position.y = 2 + Math.sin(this.time * 2) * 0.05;
      this.amountText.position.x = -6.5 + progress * 1.5; // Move with money
    }
  }
  
  animateMoneyJourney(progress) {
    // Move money along curve
    const point = this.transferCurve.getPoint(progress);
    this.money.position.copy(point);
    
    // Money rotation continues
    this.money.rotation.y = this.time * 2;
    this.money.rotation.x = Math.sin(this.time) * 0.3;
    
    // Binary particles reference removed
    
    // Amount text moves with money
    if (this.amountText) {
      this.amountText.visible = true;
      this.amountText.position.copy(point);
      this.amountText.position.y += 0.8;
    }
    
    // Bank pulses with anticipation
    this.bank.scale.set(
      1 + Math.sin(this.time * 5) * 0.05,
      1 + Math.sin(this.time * 5) * 0.05,
      1 + Math.sin(this.time * 5) * 0.05
    );
  }
  
  animateArrival(progress) {
    // Money arrives at bank
    const point = this.transferCurve.getPoint(1);
    this.money.position.copy(point);
    
    // Money slows down rotation
    this.money.rotation.y = this.time * (1 - progress) * 2;
    
    // Money scales down as it enters the bank
    this.money.scale.set(
      1 - progress * 0.9,
      1 - progress * 0.9,
      1 - progress * 0.9
    );
    
    // Bank glows more intensely
    this.bank.children.forEach(child => {
      if (child.material && child.material.emissive) {
        child.material.emissiveIntensity = 0.5 + progress * 0.5;
      }
    });
    
    // Bank pulses faster
    this.bank.scale.set(
      1 + Math.sin(this.time * 10) * 0.1 * progress,
      1 + Math.sin(this.time * 10) * 0.1 * progress,
      1 + Math.sin(this.time * 10) * 0.1 * progress
    );
    
    // Hide amount text
    if (this.amountText) {
      this.amountText.visible = progress < 0.5;
    }
    
    // Binary particles reference removed
  }
  
  animateCompletion(progress) {
    // Money is now inside the bank
    this.money.visible = false;
    
    // Fade out transfer path
    this.transferPath.material.opacity = 0.6 * (1 - progress);
    
    // Bank pulses with success
    this.bank.scale.set(
      1 + Math.sin(this.time * 3) * 0.1,
      1 + Math.sin(this.time * 3) * 0.1,
      1 + Math.sin(this.time * 3) * 0.1
    );
    
    // Show completion text
    if (this.completeText) {
      this.completeText.visible = progress > 0.2;
      if (progress > 0.2) {
        // Text fades in
        this.completeText.material.opacity = Math.min(1, (progress - 0.2) * 2);
        // Text gently floats
        this.completeText.position.y = 3 + Math.sin(this.time * 2) * 0.1;
      }
    }
    
    // Camera pulls back slightly at the end
    if (window.app && window.app.camera && progress > 0.5) {
      const pullBackAmount = (progress - 0.5) * 2 * 5; // Pull back up to 5 units
      window.app.camera.position.z = 15 + pullBackAmount;
    }
  }
  
  dispose() {
    // Remove all objects from scene
    this.objects.forEach(obj => {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        // Check if material is an array
        if (Array.isArray(obj.material)) {
          obj.material.forEach(material => material.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    this.objects = [];
    
    // Reset camera if needed
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 0, 10);
    }
  }
}