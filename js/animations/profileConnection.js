import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export class Animation10 {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.time = 0;
    this.profiles = [];
    this.connections = [];
    this.currentProfile = 0;
    this.targetProfile = 0;
    this.transitionProgress = 0;
    this.transitionSpeed = 0.015;
    this.cameraPath = [];
    this.autoRotate = true;
    
    // Animation timing
    this.profileDuration = 5; // seconds to focus on each profile
    this.transitionDuration = 3; // seconds for transition between profiles
    this.lastProfileChange = 0;
    
    // Styling
    this.colors = {
      background: 0x0a0a14,
      profileCard: 0x202030,
      profileHighlight: 0x303045,
      connectionFluid: 0x22eeff,
      text: 0xffffff,
      accent: 0x00ccff
    };
    
    this.fontLoader = new FontLoader();
    
    // Profile data - Isabel at center and 8 connections
    this.profileData = [
      {
        name: "Isabel dos Santos",
        age: 51,
        relationship: "Central Figure",
        image: "isabel_dos_santos.jpg",
        position: new THREE.Vector3(0, 0, 0),
        isCenter: true
      },
      {
        name: "José Eduardo dos Santos",
        age: 79,
        relationship: "Father, Former President of Angola",
        image: "jose_eduardo_dos_santos.jpg",
        position: new THREE.Vector3(8, 2, 0)
      },
      {
        name: "Sindika Dokolo",
        age: 48,
        relationship: "Husband, Art Collector",
        image: "sindika_dokolo.jpg",
        position: new THREE.Vector3(6, 0, 6)
      },
      {
        name: "Manuel Vicente",
        age: 66,
        relationship: "Business Associate, Former VP",
        image: "manuel_vicente.jpg", 
        position: new THREE.Vector3(0, -2, 8)
      },
      {
        name: "Paula Oliveira",
        age: 55,
        relationship: "Business Partner",
        image: "paula_oliveira.jpg",
        position: new THREE.Vector3(-6, 0, 6)
      },
      {
        name: "Mario Leite da Silva",
        age: 50,
        relationship: "Financial Advisor",
        image: "mario_silva.jpg",
        position: new THREE.Vector3(-8, 2, 0)
      },
      {
        name: "Sarju Raikundalia",
        age: 45,
        relationship: "Former Sonangol CFO",
        image: "sarju_raikundalia.jpg",
        position: new THREE.Vector3(-6, 0, -6)
      },
      {
        name: "Jorge Pontes",
        age: 52,
        relationship: "Legal Representative",
        image: "jorge_pontes.jpg",
        position: new THREE.Vector3(0, -2, -8)
      },
      {
        name: "Nuno Ribeiro da Cunha",
        age: 45,
        relationship: "Account Manager",
        image: "nuno_ribeiro.jpg",
        position: new THREE.Vector3(6, 0, -6)
      }
    ];
    
    // Default placeholder texture for profile images
    this.defaultTexture = new THREE.TextureLoader().load('/textures/placeholder_profile.jpg', () => {
      // This will be replaced with actual profile images when available
      this.updateProfileTextures();
    });
  }
  
  init() {
    // Set dark background
    this.scene.background = new THREE.Color(this.colors.background);
    
    // Set camera position
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 5, 15);
      window.app.camera.lookAt(0, 0, 0);
    }
    
    // Create lighting
    this.setupLighting();
    
    // Create profile cards
    this.createProfiles();
    
    // Create fluid connections
    this.createConnections();
    
    // Setup camera animation paths
    this.setupCameraPaths();
    
    // Create central title
    this.createTitle();
  }
  
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x333344, 1);
    this.scene.add(ambientLight);
    this.objects.push(ambientLight);
    
    // Main spotlights
    const spotLight1 = new THREE.SpotLight(0x6688ff, 10, 30, Math.PI / 6, 0.3);
    spotLight1.position.set(0, 15, 5);
    this.scene.add(spotLight1);
    this.objects.push(spotLight1);
    
    // Rim lights for depth
    const rimLight1 = new THREE.PointLight(this.colors.accent, 5, 20);
    rimLight1.position.set(-10, 5, 5);
    this.scene.add(rimLight1);
    this.objects.push(rimLight1);
    
    const rimLight2 = new THREE.PointLight(this.colors.accent, 3, 20);
    rimLight2.position.set(10, -5, -5);
    this.scene.add(rimLight2);
    this.objects.push(rimLight2);
    
    // Create soft fog for depth
    this.scene.fog = new THREE.FogExp2(this.colors.background, 0.02);
  }
  
  createProfiles() {
    // Create profile cards for each person
    this.profileData.forEach((profile, index) => {
      // Create card group
      const profileGroup = new THREE.Group();
      
      // Create card base
      const cardGeometry = new THREE.BoxGeometry(3, 4, 0.2);
      const cardMaterial = new THREE.MeshStandardMaterial({
        color: this.colors.profileCard,
        roughness: 0.7,
        metalness: 0.3
      });
      
      const card = new THREE.Mesh(cardGeometry, cardMaterial);
      profileGroup.add(card);
      
      // Create photo area
      const photoGeometry = new THREE.PlaneGeometry(2.5, 2);
      const photoMaterial = new THREE.MeshStandardMaterial({
        map: this.defaultTexture,
        roughness: 0.5,
        metalness: 0.3
      });
      
      const photo = new THREE.Mesh(photoGeometry, photoMaterial);
      photo.position.z = 0.11;
      photo.position.y = 0.8;
      profileGroup.add(photo);
      
      // Store reference to photo for texture updates
      profile.photoMesh = photo;
      
      // Add name text
      this.addProfileText(profile.name, profileGroup, 0, -0.5, 0.3);
      
      // Add age text
      this.addProfileText(`Age: ${profile.age}`, profileGroup, 0, -1.1, 0.2);
      
      // Add relationship text
      this.addProfileText(profile.relationship, profileGroup, 0, -1.7, 0.15);
      
      // Position the profile card
      profileGroup.position.copy(profile.position);
      
      // Add slant to cards to make them look like they're "sleeping"
      // Make center profile less slanted to be more prominent
      const slantAngle = profile.isCenter ? Math.PI * 0.15 : Math.PI * 0.25;
      profileGroup.rotation.x = -slantAngle; // Negative to tilt forward/down
      
      // Make the non-center cards look toward center
      if (!profile.isCenter) {
        // First rotate to face center
        profileGroup.lookAt(new THREE.Vector3(0, 0, 0));
        // Then apply the slant
        profileGroup.rotateX(-slantAngle);
      }
      
      // Store original scales and positions for animations
      profileGroup.userData = {
        originalScale: new THREE.Vector3(1, 1, 1),
        originalPosition: profile.position.clone(),
        originalRotation: profileGroup.rotation.clone(),
        index: index,
        isCenter: profile.isCenter
      };
      
      // Add highlight effect for center profile
      if (profile.isCenter) {
        const highlightGeometry = new THREE.BoxGeometry(3.2, 4.2, 0.15);
        const highlightMaterial = new THREE.MeshBasicMaterial({
          color: this.colors.accent,
          transparent: true,
          opacity: 0.5,
          side: THREE.BackSide
        });
        
        const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        profileGroup.add(highlight);
        
        // Add glow effect
        const glowLight = new THREE.PointLight(this.colors.accent, 3, 5);
        glowLight.position.set(0, 0, -1);
        profileGroup.add(glowLight);
      }
      
      this.scene.add(profileGroup);
      this.profiles.push(profileGroup);
      this.objects.push(profileGroup);
    });
  }
  
  addProfileText(text, parent, x, y, size) {
    // Add text to profile cards
    // For now, create a placeholder
    const textGeometry = new THREE.PlaneGeometry(2, 0.3);
    const textMaterial = new THREE.MeshBasicMaterial({
      color: this.colors.text,
      transparent: true,
      opacity: 0.9
    });
    
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(x, y, 0.11);
    parent.add(textMesh);
    
    // We'll replace this with actual text geometry once fonts are loaded
    this.fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
      const geometry = new TextGeometry(text, {
        font: font,
        size: size,
        height: 0.01,
        curveSegments: 4
      });
      
      // Center the text
      geometry.computeBoundingBox();
      const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      
      const textMaterial = new THREE.MeshStandardMaterial({
        color: this.colors.text,
        roughness: 0.3,
        metalness: 0.7
      });
      
      const actualText = new THREE.Mesh(geometry, textMaterial);
      actualText.position.set(x - textWidth/2, y, 0.11);
      
      // Replace the placeholder
      parent.remove(textMesh);
      parent.add(actualText);
    });
  }
  
  createConnections() {
    // Create fluid-like connections between Isabel and other profiles
    const centerProfile = this.profiles[0];
    
    // Define connection points on the sides of the central profile
    const connectionPoints = [
      new THREE.Vector3(-1.5, 0, 0), // Left side
      new THREE.Vector3(1.5, 0, 0),  // Right side
      new THREE.Vector3(0, -2, 0),   // Bottom side
      new THREE.Vector3(0, 2, 0)     // Top side
    ];
    
    for (let i = 1; i < this.profiles.length; i++) {
      const profile = this.profiles[i];
      
      // Pick a connection point based on the profile's position relative to center
      const connectionPointIndex = this.getClosestConnectionPoint(centerProfile.position, profile.position, connectionPoints);
      const startPoint = centerProfile.position.clone().add(connectionPoints[connectionPointIndex]);
      
      const connection = this.createFluidConnection(startPoint, profile.position);
      connection.userData.connectionPointIndex = connectionPointIndex;
      this.connections.push(connection);
      this.scene.add(connection);
      this.objects.push(connection);
    }
  }
  
  // Helper method to determine which side of the center profile to connect from
  getClosestConnectionPoint(centerPos, targetPos, connectionPoints) {
    // Determine which quadrant the target is in relation to center
    const relativePos = new THREE.Vector3().subVectors(targetPos, centerPos);
    
    // Check if target is more horizontal or vertical from center
    if (Math.abs(relativePos.x) > Math.abs(relativePos.z)) {
      // More horizontal - use left or right side connection
      return relativePos.x > 0 ? 1 : 0; // Right : Left
    } else {
      // More vertical - use top or bottom side connection
      return relativePos.z > 0 ? 2 : 3; // Bottom : Top
    }
  }
  
  createFluidConnection(startPoint, endPoint) {
    // Create a more natural curve between the two points with a slight arc
    // Find midpoint between start and end, but offset based on orientation
    const direction = new THREE.Vector3().subVectors(endPoint, startPoint).normalize();
    const distance = startPoint.distanceTo(endPoint);
    
    // Create an offset perpendicular to the connection direction
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize().multiplyScalar(distance * 0.25);
    
    // Create mid-point with some height and perpendicular offset for a natural curve
    const midPoint = new THREE.Vector3()
      .addVectors(startPoint, endPoint)
      .multiplyScalar(0.5)
      .add(perpendicular) // Add perpendicular offset
      .add(new THREE.Vector3(0, 1, 0)); // Add some height
    
    const curve = new THREE.QuadraticBezierCurve3(
      startPoint,
      midPoint,
      endPoint
    );
    
    // Create the tube geometry along the curve
    const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.connectionFluid,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.6,
      emissive: this.colors.connectionFluid,
      emissiveIntensity: 0.5
    });
    
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    
    // Create particle system along the curve
    const particleCount = 50;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const point = curve.getPoint(t);
      
      particlePositions[i * 3] = point.x;
      particlePositions[i * 3 + 1] = point.y;
      particlePositions[i * 3 + 2] = point.z;
      
      particleSizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: this.colors.connectionFluid,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    
    // Create a group to hold both the tube and particles
    const connectionGroup = new THREE.Group();
    connectionGroup.add(tube);
    connectionGroup.add(particles);
    
    // Store curve and particles for animation
    connectionGroup.userData = {
      curve: curve,
      particles: particles,
      tube: tube,
      progress: 0,
      active: false,
      startPoint: startPoint.clone(),
      midPoint: midPoint.clone(),
      endPoint: endPoint.clone()
    };
    
    return connectionGroup;
  }
  
  setupCameraPaths() {
    // Create camera paths for transitions between profiles
    for (let i = 1; i < this.profiles.length; i++) {
      const centerPosition = this.profileData[0].position;
      const profilePosition = this.profileData[i].position;
      
      // Create a smooth curve for the camera to follow
      const midPoint = new THREE.Vector3().addVectors(centerPosition, profilePosition).multiplyScalar(0.5);
      midPoint.y += 3; // Add height for a nice arc
      
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 5, 15), // Camera start position
        midPoint,
        new THREE.Vector3(
          profilePosition.x * 0.8,
          profilePosition.y + 3,
          profilePosition.z * 0.8
        )
      );
      
      this.cameraPath.push(curve);
    }
  }
  
  createTitle() {
    // Create title text
    this.fontLoader.load('/fonts/helvetiker_bold.typeface.json', (font) => {
      const textGeometry = new TextGeometry('PROFILE CONNECTIONS', {
        font: font,
        size: 0.8,
        height: 0.1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
      });
      
      textGeometry.center();
      
      const textMaterial = new THREE.MeshStandardMaterial({
        color: this.colors.text,
        roughness: 0.3,
        metalness: 0.7,
        emissive: this.colors.accent,
        emissiveIntensity: 0.3
      });
      
      this.titleText = new THREE.Mesh(textGeometry, textMaterial);
      this.titleText.position.set(0, 6, 0);
      
      this.scene.add(this.titleText);
      this.objects.push(this.titleText);
    });
  }
  
  updateProfileTextures() {
    // In a real implementation, this would load actual images
    // For now, we'll create colored textures as placeholders
    this.profiles.forEach((profile, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      
      // Generate a gradient based on profile index
      const hue = (index * 40) % 360;
      ctx.fillStyle = `hsl(${hue}, 70%, ${index === 0 ? 60 : 40}%)`;
      ctx.fillRect(0, 0, 256, 256);
      
      // Add a placeholder portrait
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(128, 105, 70, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(128, 105, 68, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw a simple face
      ctx.fillStyle = '#333333';
      // Eyes
      ctx.beginPath();
      ctx.ellipse(108, 90, 8, 12, 0, 0, Math.PI * 2);
      ctx.ellipse(148, 90, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // Mouth
      ctx.beginPath();
      ctx.arc(128, 130, 20, 0, Math.PI);
      ctx.stroke();
      
      // Add name initials
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      ctx.fillText(this.profileData[index].name.split(' ').map(n => n[0]).join(''), 128, 180);
      
      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      
      // Update the profile texture
      const profilePhoto = this.profileData[index].photoMesh;
      if (profilePhoto) {
        profilePhoto.material.map = texture;
        profilePhoto.material.needsUpdate = true;
      }
    });
  }
  
  update() {
    const deltaTime = 0.016; // Approx 60fps
    this.time += deltaTime;
    
    // Update fluid connections
    this.updateConnections(deltaTime);
    
    // Handle profile transitions
    this.handleProfileTransition(deltaTime);
    
    // Update profile cards (scaling, rotation)
    this.updateProfiles(deltaTime);
    
    // Rotate the entire system slowly if auto-rotate is enabled
    if (this.autoRotate && this.transitionProgress === 0) {
      const rotationSpeed = 0.05 * deltaTime;
      this.profiles.forEach((profile) => {
        // Rotate around the Y axis
        const currentPos = profile.position.clone();
        const angle = rotationSpeed;
        const newX = currentPos.x * Math.cos(angle) - currentPos.z * Math.sin(angle);
        const newZ = currentPos.x * Math.sin(angle) + currentPos.z * Math.cos(angle);
        
        profile.position.x = newX;
        profile.position.z = newZ;
        
        // Make non-center profiles look at center
        if (!profile.userData.isCenter) {
          profile.lookAt(new THREE.Vector3(0, 0, 0));
        }
      });
    }
  }
  
  updateConnections(deltaTime) {
    // Animate the fluid connections
    this.connections.forEach((connection, index) => {
      // Get the particles
      const particles = connection.userData.particles;
      if (!particles) return;
      
      // Update each particle
      const positions = particles.geometry.attributes.position.array;
      const curve = connection.userData.curve;
      
      // Flow speed based on whether this connection is active
      const flowSpeed = connection.userData.active ? 0.2 : 0.05;
      
      for (let i = 0; i < positions.length / 3; i++) {
        // Update progress along the curve
        connection.userData.progress = (connection.userData.progress + flowSpeed * deltaTime) % 1;
        
        // Move particle along the curve
        const t = (i / (positions.length / 3) + connection.userData.progress) % 1;
        const point = curve.getPoint(t);
        
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      
      // Pulse the tube opacity based on active state
      const tube = connection.userData.tube;
      if (tube) {
        const pulseFrequency = connection.userData.active ? 5 : 2;
        const minOpacity = connection.userData.active ? 0.6 : 0.2;
        const maxOpacity = connection.userData.active ? 1.0 : 0.4;
        
        tube.material.opacity = minOpacity + (Math.sin(this.time * pulseFrequency) * 0.5 + 0.5) * (maxOpacity - minOpacity);
        tube.material.emissiveIntensity = minOpacity + Math.sin(this.time * pulseFrequency) * 0.3;
      }
      
      // Update connection endpoints if profiles have moved
      if (index < this.profiles.length - 1) {
        const centerProfile = this.profiles[0];
        const targetProfile = this.profiles[index + 1];
        
        // Get the connection point from the center
        const connectionPointIndex = connection.userData.connectionPointIndex;
        const connectionPoints = [
          new THREE.Vector3(-1.5, 0, 0), // Left side
          new THREE.Vector3(1.5, 0, 0),  // Right side
          new THREE.Vector3(0, -2, 0),   // Bottom side
          new THREE.Vector3(0, 2, 0)     // Top side
        ];
        
        // Update start and end points
        const startPoint = centerProfile.position.clone().add(connectionPoints[connectionPointIndex]);
        const endPoint = targetProfile.position.clone();
        
        // Update midpoint
        const direction = new THREE.Vector3().subVectors(endPoint, startPoint).normalize();
        const distance = startPoint.distanceTo(endPoint);
        const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize().multiplyScalar(distance * 0.25);
        const midPoint = new THREE.Vector3()
          .addVectors(startPoint, endPoint)
          .multiplyScalar(0.5)
          .add(perpendicular)
          .add(new THREE.Vector3(0, 1, 0));
        
        // Create new curve with updated points
        const newCurve = new THREE.QuadraticBezierCurve3(
          startPoint,
          midPoint,
          endPoint
        );
        
        // Update the geometry with the new curve
        const tubeGeometry = new THREE.TubeGeometry(newCurve, 20, 0.05, 8, false);
        connection.userData.tube.geometry.dispose();
        connection.userData.tube.geometry = tubeGeometry;
        
        // Update stored curve
        connection.userData.curve = newCurve;
      }
    });
  }
  
  handleProfileTransition(deltaTime) {
    // Time-based profile transitions
    if (this.transitionProgress === 0) {
      // Only start a new transition if one isn't in progress
      if (this.time - this.lastProfileChange > this.profileDuration) {
        // Move to next profile
        this.currentProfile = this.targetProfile;
        this.targetProfile = (this.targetProfile % (this.profiles.length - 1)) + 1; // Skip center (0)
        this.transitionProgress = deltaTime;
        this.lastProfileChange = this.time;
        
        // Activate the connection being transitioned to
        if (this.connections[this.targetProfile - 1]) {
          this.connections.forEach(conn => conn.userData.active = false);
          this.connections[this.targetProfile - 1].userData.active = true;
        }
      }
    } else {
      // Continue ongoing transition
      this.transitionProgress += this.transitionSpeed;
      
      if (this.transitionProgress >= 1) {
        // Transition complete
        this.transitionProgress = 0;
      }
      
      // Update camera position based on transition progress
      if (window.app && window.app.camera) {
        // If transitioning to a profile
        if (this.targetProfile > 0) {
          const path = this.cameraPath[this.targetProfile - 1];
          const point = path.getPoint(this.transitionProgress);
          window.app.camera.position.copy(point);
          
          // Look at the target profile
          if (this.targetProfile < this.profiles.length) {
            window.app.camera.lookAt(this.profiles[this.targetProfile].position);
          }
        }
        // If transitioning back to center
        else if (this.currentProfile > 0) {
          const path = this.cameraPath[this.currentProfile - 1];
          const point = path.getPoint(1 - this.transitionProgress);
          window.app.camera.position.copy(point);
          window.app.camera.lookAt(new THREE.Vector3(0, 0, 0));
        }
      }
    }
  }
  
  updateProfiles(deltaTime) {
    // Update profile card scales based on camera focus
    this.profiles.forEach((profile, index) => {
      // Get distance from profile to camera
      let scale = 1;
      
      // Scale up the focused profile
      if (index === this.targetProfile && this.transitionProgress > 0.5) {
        scale = 1 + (this.transitionProgress - 0.5) * 0.5;
      }
      
      // Smoothly update scale
      profile.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      
      // Slight hover animation
      if (index > 0) { // Skip center profile
        profile.position.y = profile.userData.originalPosition.y + Math.sin(this.time * 1.5 + index) * 0.1;
      }
      
      // Subtle rotation animation for the center profile
      if (index === 0) {
        profile.rotation.y = Math.sin(this.time * 0.5) * 0.1;
      }
    });
    
    // Update title text
    if (this.titleText) {
      this.titleText.rotation.y = Math.sin(this.time * 0.3) * 0.1;
      this.titleText.position.y = 6 + Math.sin(this.time) * 0.1;
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
    this.profiles = [];
    this.connections = [];
    
    // Remove fog
    this.scene.fog = null;
    
    // Reset camera if needed
    if (window.app && window.app.camera) {
      window.app.camera.position.set(0, 0, 10);
      window.app.camera.lookAt(0, 0, 0);
    }
  }
}
