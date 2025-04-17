/**
 * Shimeji - Main Class
 * Responsible for coordinating all Shimeji functionality
 */

import DOMUtils from '../utils/DOMUtils.js';
import PhysicsEngine from './PhysicsEngine.js';
import BehaviorManager from '../behaviors/BehaviorManager.js';
import StateManager from './StateManager.js';
import SecurityManager from '../security/SecurityManager.js';
import UIManager from '../ui/UIManager.js';
import DialogueManager from '../ui/DialogueManager.js';
import ContactForm from '../ui/ContactForm.js';
import AIAgent from './AIAgent.js';

class Shimeji {
  constructor(options = {}) {
    // Basic configuration
    this.elementId = options.elementId || 'shimeji-container';
    this.characterName = options.characterName || 'hutao';
    this.language = options.language || 'en';
    this.imgPath = options.imgPath || './assets/img/';
    this.baseUrl = options.baseUrl || '';
    
    // Initialize DOM container
    this.container = document.getElementById(this.elementId);
    if (!this.container) {
      this.container = DOMUtils.createContainer(this.elementId);
    }
    
    // Initialize sub-systems
    this.initSubsystems(options);
    
    // Initialize character
    this.loadCharacter();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Start character behaviors and animations
    this.start();
  }
  
  initSubsystems(options) {
    // Physics system
    this.physics = new PhysicsEngine({
      gravity: options.gravity || 0.8,
      friction: options.friction || 0.8,
      walkSpeed: options.walkSpeed || 1.5,
      dragSpeed: options.dragSpeed || 5,
      fallSpeed: options.fallSpeed || 15,
      jumpHeight: options.jumpHeight || -12
    });
    
    // State management
    this.stateManager = new StateManager(this);
    
    // Behaviors
    this.behaviorManager = new BehaviorManager(this, {
      idleTimeout: options.idleTimeout || 10000,
      enableIdle: options.enableIdle !== undefined ? options.enableIdle : true
    });
    
    // UI components
    this.ui = new UIManager(this);
    this.dialogue = new DialogueManager(this, {
      autoRespond: options.autoRespond !== undefined ? options.autoRespond : true,
      directDialogueMode: options.directDialogueMode !== undefined ? options.directDialogueMode : true
    });
    
    // AI capabilities
    this.aiAgent = new AIAgent(this, {
      chatEnabled: options.chatEnabled !== undefined ? options.chatEnabled : true,
      nlpEnabled: true,
      languageDetectionEnabled: true,
      adaptiveModeEnabled: true
    });
    
    // Security features
    this.security = new SecurityManager(this);
    
    // Contact form
    this.contactForm = new ContactForm(this);
  }
  
  loadCharacter() {
    this.stateManager.setState('loading');
    
    // Load character assets and configuration
    DOMUtils.createElements(this.container, this.characterName);
    
    // Set initial state once loaded
    this.stateManager.setState('idle');
  }
  
  setupEventListeners() {
    DOMUtils.addEventListeners(this);
  }
  
  start() {
    this.behaviorManager.startBehaviorLoop();
    this.stateManager.startAnimation();
    
    // Show welcome message
    this.dialogue.showDialogue('welcome', this.dialogue.getWelcomeMessage());
  }
  
  // Public API methods
  
  showEmotion(emotion) {
    this.stateManager.showEmotion(emotion);
  }
  
  showDialogue(context, message = null, duration = 4000) {
    this.dialogue.showDialogue(context, message, duration);
  }
  
  moveTo(targetX, targetY, state = 'walking') {
    this.behaviorManager.moveTo(targetX, targetY, state);
  }
  
  setAdaptiveMode(enabled) {
    this.aiAgent.setAdaptiveMode(enabled);
  }
  
  setupContactForm(options = {}) {
    this.contactForm.setup(options);
  }
  
  // Security related methods
  
  handleDevToolsOpened(reason) {
    this.security.handleDevToolsOpened(reason);
  }
  
  // Cleanup method
  
  cleanup() {
    this.behaviorManager.stopBehaviorLoop();
    this.stateManager.stopAnimation();
    DOMUtils.removeEventListeners(this);
    this.container.remove();
  }
}

export default Shimeji; 