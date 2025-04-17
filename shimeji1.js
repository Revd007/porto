/**
 * Shimeji1.js - Interactive character for web pages
 * 
 * This is a standalone implementation that works with regular script tags
 */

(function() {
  // Define the Shimeji class
  class Shimeji {
    constructor(options = {}) {
      // Basic configuration
      this.elementId = options.elementId || 'shimeji-container';
      this.characterName = options.characterName || 'shime';
      this.language = options.language || 'en';
      this.imgPath = options.imgPath || '../assets/img/';
      this.baseUrl = options.baseUrl || '';
      
      // Initialize DOM container
      this.container = document.getElementById(this.elementId);
      if (!this.container) {
        this.container = this.createContainer(this.elementId);
      }
      
      // State tracking
      this.currentState = 'idle';
      this.lastState = 'idle';
      this.isMoving = false;
      this.isDragging = false;
      this.isJumping = false;
      this.direction = 'right';
      
      // Image frame mapping
      this.stateFrames = {
        idle: [1, 2, 3, 4],
        walking: [5, 6, 7, 8, 9],
        running: [10, 11, 12, 13, 14],
        jumping: [15, 16, 17, 18, 19],
        falling: [20, 21, 22, 23],
        happy: [24, 25, 26, 27],
        surprised: [28, 29, 30, 31],
        thinking: [32, 33, 34, 35],
        sleeping: [36, 37, 38, 39],
        sitting: [40, 41, 42, 43]
      };
      this.currentFrame = 0;
      this.frameCount = 0;
      
      // Position
      this.x = 100;
      this.y = window.innerHeight - 100;
      this.vx = 0;
      this.vy = 0;
      this.targetX = null;
      this.targetY = null;
      
      // Physics constants
      this.gravity = options.gravity || 0.8;
      this.friction = options.friction || 0.8;
      this.walkSpeed = options.walkSpeed || 1.5;
      this.dragSpeed = options.dragSpeed || 5;
      this.fallSpeed = options.fallSpeed || 15;
      this.jumpHeight = options.jumpHeight || -12;
      
      // Animation settings
      this.frameRate = 100; // ms per frame
      this.lastFrameTime = 0;
      this.animationFrame = null;
      
      // AI capabilities
      this.chatEnabled = options.chatEnabled !== undefined ? options.chatEnabled : true;
      this.memory = {
        interactions: [],
        topics: {},
        userPreferences: {},
        contextual: {}
      };
      
      // Initialize character
      this.loadCharacter();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Start animation loop
      this.startAnimation();
      
      // Show welcome message after a short delay
      setTimeout(() => {
        this.showWelcomeMessage();
      }, 2000);
    }
    
    // Static methods
    static injectAntiDevTools() {
      console.log('Anti-DevTools protection activated');
      
      // Create anti-inspection styles
      const style = document.createElement('style');
      style.textContent = `
        /* Hide DevTools-related elements */
        .__devtools__, .__debug__, .drawer-contents, 
        .console-view, .panel, .elements-tree {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        
        /* Protect images */
        img {
          user-select: none;
          -webkit-user-drag: none;
        }
      `;
      document.head.appendChild(style);
      
      // Detect DevTools in various ways
      const detectDevTools = () => {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
          // DevTools is probably open - notify the Shimeji instance
          if (window.hutaoInstance) {
            window.hutaoInstance.handleDevToolsOpened('size detection');
          }
        }
      };
      
      // Check on resize and periodically
      window.addEventListener('resize', detectDevTools);
      setInterval(detectDevTools, 1000);
      
      return true;
    }
    
    // DOM Manipulation
    createContainer(id) {
      const container = document.createElement('div');
      container.id = id;
      container.className = 'shimeji-container';
      container.style.position = 'fixed';
      container.style.left = '100px';
      container.style.bottom = '0';
      container.style.width = '100px';
      container.style.height = '100px';
      container.style.zIndex = '9999';
      container.style.cursor = 'pointer';
      container.style.userSelect = 'none';
      
      document.body.appendChild(container);
      return container;
    }
    
    loadCharacter() {
      this.container.innerHTML = '';
      this.container.className = 'shimeji-container idle';
      
      const imgElement = document.createElement('img');
      imgElement.className = 'shimeji-character';
      
      // Get the image for the current state and frame
      const frameIndex = this.getFrameForState(this.currentState, this.currentFrame);
      imgElement.src = `${this.imgPath}${this.characterName}${frameIndex}.png`;
      imgElement.alt = this.characterName;
      
      imgElement.onload = () => {
        this.container.style.display = 'block';
      };
      
      imgElement.onerror = () => {
        console.warn(`Failed to load image for: ${this.characterName}${frameIndex}.png`);
        // Try to load the first frame
        imgElement.src = `${this.imgPath}${this.characterName}1.png`;
      };
      
      this.container.appendChild(imgElement);
      this.imageElement = imgElement;
    }
    
    getFrameForState(state, frameIndex) {
      // Get the array of frame numbers for this state
      const frames = this.stateFrames[state] || this.stateFrames.idle;
      
      // Get the frame at the current index (cycle through the frames)
      return frames[frameIndex % frames.length];
    }
    
    // State Management
    setState(newState) {
      if (this.currentState !== newState) {
        this.lastState = this.currentState;
        this.currentState = newState;
        this.currentFrame = 0; // Reset frame counter when changing state
        
        // Update container class
        this.container.className = `shimeji-container ${newState}`;
        
        // Update image if available
        this.updateFrame();
      }
    }
    
    updateFrame() {
      if (!this.imageElement) return;
      
      // Get the next frame number for the current state
      const frameIndex = this.getFrameForState(this.currentState, this.currentFrame);
      
      // Update the image source
      this.imageElement.src = `${this.imgPath}${this.characterName}${frameIndex}.png`;
      
      // Increment frame counter
      this.currentFrame = (this.currentFrame + 1) % (this.stateFrames[this.currentState]?.length || 1);
    }
    
    showEmotion(emotion) {
      const previousState = this.currentState;
      this.setState(emotion);
      
      // Return to previous state after a delay
      setTimeout(() => {
        this.setState(previousState);
      }, 2000);
    }
    
    // Movement and Physics
    update() {
      // Handle automated movement toward target
      if (this.isMoving && this.targetX !== null && this.targetY !== null) {
        this.moveTowardTarget();
      }
      
      // Apply physics if not being dragged
      if (!this.isDragging) {
        // Apply gravity
        this.vy += this.gravity;
        
        // Apply friction to horizontal movement
        this.vx *= this.friction;
        
        // Update position based on velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Handle screen boundaries
        this.handleBoundaries();
      }
      
      // Update direction based on horizontal velocity
      if (this.vx > 0.1) {
        this.direction = 'right';
        this.container.style.transform = 'scaleX(1)';
      } else if (this.vx < -0.1) {
        this.direction = 'left';
        this.container.style.transform = 'scaleX(-1)';
      }
      
      // Update position
      this.container.style.left = `${this.x}px`;
      this.container.style.top = `${this.y}px`;
      
      // Update state based on movement
      if (Math.abs(this.vx) > 0.5 || Math.abs(this.vy) > 0.5) {
        if (Math.abs(this.vx) > 3) {
          this.setState('running');
        } else {
          this.setState('walking');
        }
      } else if (this.isDragging) {
        this.setState('happy');
      } else {
        this.setState('idle');
      }
      
      // Update animation frame every few frames
      this.frameCount++;
      if (this.frameCount >= 10) { // Change frame every 10 update cycles
        this.frameCount = 0;
        this.updateFrame();
      }
    }
    
    moveTowardTarget() {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 5) {
        // Target reached
        this.targetX = null;
        this.targetY = null;
        this.isMoving = false;
        return;
      }
      
      // Calculate normalized direction vector
      const nx = dx / distance;
      const ny = dy / distance;
      
      // Apply movement in the direction of the target
      this.vx = nx * this.walkSpeed;
      this.vy = ny * this.walkSpeed;
    }
    
    handleBoundaries() {
      // Keep within horizontal screen bounds
      const minX = 0;
      const maxX = window.innerWidth - 100; // Adjust based on character width
      
      if (this.x < minX) {
        this.x = minX;
        this.vx = Math.abs(this.vx) * 0.5; // Bounce with reduced velocity
      } else if (this.x > maxX) {
        this.x = maxX;
        this.vx = -Math.abs(this.vx) * 0.5; // Bounce with reduced velocity
      }
      
      // Keep within vertical screen bounds
      const minY = 0;
      const maxY = window.innerHeight - 100; // Adjust based on character height
      
      if (this.y < minY) {
        this.y = minY;
        this.vy = 0;
      } else if (this.y > maxY) {
        this.y = maxY;
        this.vy = 0;
        this.isJumping = false;
      }
    }
    
    // Animation
    startAnimation() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
      
      const animate = (timestamp) => {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        
        const elapsed = timestamp - this.lastFrameTime;
        
        if (elapsed > 16) { // ~60fps
          this.lastFrameTime = timestamp;
          this.update();
        }
        
        this.animationFrame = requestAnimationFrame(animate);
      };
      
      this.animationFrame = requestAnimationFrame(animate);
    }
    
    stopAnimation() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    }
    
    // Event Handling
    setupEventListeners() {
      // Mouse interaction
      this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
      document.addEventListener('mouseup', this.handleMouseUp.bind(this));
      document.addEventListener('mousemove', this.handleMouseMove.bind(this));
      
      // Touch interaction for mobile
      this.container.addEventListener('touchstart', this.handleTouchStart.bind(this));
      document.addEventListener('touchend', this.handleTouchEnd.bind(this));
      document.addEventListener('touchmove', this.handleTouchMove.bind(this));
      
      // Window resize
      window.addEventListener('resize', this.handleResize.bind(this));
      
      // Click to show dialogue or jump
      this.container.addEventListener('click', this.handleClick.bind(this));
    }
    
    handleMouseDown(event) {
      event.preventDefault();
      this.isDragging = true;
      this.container.classList.add('dragging');
      this.offsetX = event.clientX - this.container.offsetLeft;
      this.offsetY = event.clientY - this.container.offsetTop;
    }
    
    handleMouseUp() {
      this.isDragging = false;
      this.container.classList.remove('dragging');
    }
    
    handleMouseMove(event) {
      if (this.isDragging) {
        this.x = event.clientX - this.offsetX;
        this.y = event.clientY - this.offsetY;
        this.container.style.left = `${this.x}px`;
        this.container.style.top = `${this.y}px`;
      }
    }
    
    handleTouchStart(event) {
      event.preventDefault();
      this.isDragging = true;
      this.container.classList.add('dragging');
      this.offsetX = event.touches[0].clientX - this.container.offsetLeft;
      this.offsetY = event.touches[0].clientY - this.container.offsetTop;
    }
    
    handleTouchEnd() {
      this.isDragging = false;
      this.container.classList.remove('dragging');
    }
    
    handleTouchMove(event) {
      if (this.isDragging) {
        this.x = event.touches[0].clientX - this.offsetX;
        this.y = event.touches[0].clientY - this.offsetY;
        this.container.style.left = `${this.x}px`;
        this.container.style.top = `${this.y}px`;
      }
    }
    
    handleResize() {
      this.handleBoundaries();
    }
    
    handleClick(event) {
      // Prevent drag handling
      if (this.isDragging) return;
      
      // Check if it was a quick click (not a drag attempt)
      if (Math.abs(event.clientX - (this.x + this.offsetX)) < 10 &&
          Math.abs(event.clientY - (this.y + this.offsetY)) < 10) {
        // 70% chance to show dialogue, 30% chance to jump
        if (Math.random() < 0.7) {
          this.showRandomDialogue();
        } else {
          this.jump();
        }
      }
    }
    
    jump() {
      if (!this.isJumping) {
        this.isJumping = true;
        this.vy = this.jumpHeight;
        this.setState('jumping');
      }
    }
    
    // AI and Dialogue Methods
    showWelcomeMessage() {
      const welcomeMessages = [
        "Hello! I'm here to help with the portfolio!",
        "Welcome to the portfolio! Click me if you need anything!",
        "Hi there! I can assist you with navigating this portfolio!"
      ];
      
      const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
      this.showEmotion('happy');
      this.showDialogue('welcome', welcomeMessages[randomIndex], 5000);
    }
    
    showRandomDialogue() {
      // Get current section to provide contextual dialogue
      const currentSection = this.getCurrentSection();
      
      // Show different dialogues based on the section
      switch (currentSection) {
        case 'home':
          this.showEmotion('happy');
          this.showDialogue('home', "Welcome to Revian's portfolio! You can scroll down to see skills and projects.");
          break;
        case 'about':
          this.showEmotion('thinking');
          this.showDialogue('about', "Revian is a Frontend Developer with experience in React, Angular, and modern UI frameworks.");
          break;
        case 'experience':
          this.showEmotion('happy');
          this.showDialogue('experience', "Revian has worked on various frontend projects. Click on the experience cards to learn more!");
          break;
        case 'projects':
          this.showEmotion('proud');
          this.showDialogue('projects', "Check out these cool projects! Each highlights different frontend skills.");
          break;
        case 'contact':
          this.showEmotion('excited');
          this.showDialogue('contact', "Want to get in touch? Fill out the form and I'll make sure your message is delivered!");
          break;
        default:
          // Generic messages if section is unknown
          const randomMessages = [
            "Need help navigating the portfolio?",
            "You can drag me around the screen!",
            "Click the navigation links to explore different sections.",
            "Feel free to check out the projects section!",
            "The contact form is at the bottom of the page.",
            "Revian specializes in frontend development with modern frameworks."
          ];
          
          const randomIndex = Math.floor(Math.random() * randomMessages.length);
          this.showEmotion('happy');
          this.showDialogue('random', randomMessages[randomIndex]);
      }
      
      // Remember this interaction
      this.rememberInteraction('click', currentSection);
    }
    
    getCurrentSection() {
      // Get visible sections to determine where the user is
      const sections = ['home', 'about', 'experience', 'projects', 'contact'];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if section is visible in viewport
          if (rect.top < window.innerHeight/2 && rect.bottom > 0) {
            return section;
          }
        }
      }
      
      return 'unknown';
    }
    
    rememberInteraction(type, context) {
      this.memory.interactions.push({
        timestamp: new Date().toISOString(),
        type,
        context
      });
      
      // Limit memory size
      if (this.memory.interactions.length > 10) {
        this.memory.interactions.shift();
      }
      
      // Track context interest
      this.memory.topics[context] = (this.memory.topics[context] || 0) + 1;
    }
    
    // Public API
    moveTo(targetX, targetY) {
      this.targetX = targetX;
      this.targetY = targetY;
      this.isMoving = true;
    }
    
    showDialogue(context, message, duration = 4000) {
      // Create dialogue element if needed
      let dialogueEl = document.querySelector('.shimeji-dialogue');
      if (!dialogueEl) {
        dialogueEl = document.createElement('div');
        dialogueEl.className = 'shimeji-dialogue';
        dialogueEl.style.position = 'fixed';
        dialogueEl.style.left = `${this.x + 80}px`;
        dialogueEl.style.top = `${this.y - 30}px`;
        dialogueEl.style.background = 'white';
        dialogueEl.style.padding = '10px';
        dialogueEl.style.borderRadius = '16px';
        dialogueEl.style.maxWidth = '200px';
        dialogueEl.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        dialogueEl.style.zIndex = '10000';
        dialogueEl.style.transformOrigin = 'bottom left';
        dialogueEl.style.animation = 'dialogueEnter 0.3s forwards';
        
        const style = document.createElement('style');
        style.textContent = `
          @keyframes dialogueEnter {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          
          @keyframes dialogueExit {
            from { transform: scale(1); opacity: 1; }
            to { transform: scale(0.8); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(dialogueEl);
      }
      
      // Update position and content
      dialogueEl.style.left = `${this.x + 80}px`;
      dialogueEl.style.top = `${this.y - 30}px`;
      dialogueEl.textContent = message || 'Hello!';
      dialogueEl.style.display = 'block';
      dialogueEl.style.animation = 'dialogueEnter 0.3s forwards';
      
      // Auto-hide after duration
      clearTimeout(this.dialogueTimeout);
      this.dialogueTimeout = setTimeout(() => {
        dialogueEl.style.animation = 'dialogueExit 0.3s forwards';
        setTimeout(() => {
          dialogueEl.style.display = 'none';
        }, 300);
      }, duration);
    }
    
    setupContactForm(options = {}) {
      this.contactOptions = options;
      
      // Find contact form
      const contactForm = document.querySelector('form');
      if (!contactForm) return;
      
      // Enable the submit button
      const submitButton = contactForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
      }
      
      // Add submit handler
      contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Get form data
        const nameInput = contactForm.querySelector('#name');
        const emailInput = contactForm.querySelector('#email');
        const messageInput = contactForm.querySelector('#message');
        
        if (!nameInput || !emailInput || !messageInput) return;
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
        
        // Validate input
        if (!name || !email || !message) {
          this.showEmotion('thinking');
          this.showDialogue('contact', 'Please fill out all fields before sending.');
          return;
        }
        
        // Show sending message
        this.showEmotion('happy');
        this.showDialogue('contact', 'Thanks! I\'m sending your message now...');
        
        // In a real implementation, you would send the email through a service
        // This is a mock implementation
        setTimeout(() => {
          this.showEmotion('happy');
          this.showDialogue('contact', 'Your message has been sent! I\'ll make sure it gets delivered.', 6000);
          
          // Reset form
          contactForm.reset();
        }, 2000);
      });
    }
    
    handleDevToolsOpened(reason) {
      this.showEmotion('surprised');
      this.showDialogue('security', 'DevTools detected! Please respect this work!', 5000);
    }
    
    // Clean up resources
    cleanup() {
      this.stopAnimation();
      
      // Remove event listeners
      this.container.removeEventListener('mousedown', this.handleMouseDown);
      document.removeEventListener('mouseup', this.handleMouseUp);
      document.removeEventListener('mousemove', this.handleMouseMove);
      
      this.container.removeEventListener('touchstart', this.handleTouchStart);
      document.removeEventListener('touchend', this.handleTouchEnd);
      document.removeEventListener('touchmove', this.handleTouchMove);
      
      window.removeEventListener('resize', this.handleResize);
      
      // Remove DOM elements
      if (this.container) {
        this.container.remove();
      }
      
      const dialogueEl = document.querySelector('.shimeji-dialogue');
      if (dialogueEl) {
        dialogueEl.remove();
      }
    }
  }
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.Shimeji = Shimeji;
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      // Auto-initialize if data attribute is present
      const autoInitElements = document.querySelectorAll('[data-shimeji-auto-init]');
      if (autoInitElements.length > 0) {
        const options = {};
        const element = autoInitElements[0];
        
        // Parse data attributes as options
        Array.from(element.attributes)
          .filter(attr => attr.name.startsWith('data-shimeji-'))
          .forEach(attr => {
            const optionName = attr.name
              .replace('data-shimeji-', '')
              .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            
            options[optionName] = attr.value;
          });
        
        // Initialize Shimeji with the options
        window.hutaoInstance = new Shimeji(options);
      } else {
        // Default initialization
        window.hutaoInstance = new Shimeji({
          characterName: 'shime',
          imgPath: '../assets/img/'
        });
      }
    });
  }
})();