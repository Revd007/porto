/**
 * BehaviorManager - Manages Shimeji character behaviors and automated actions
 */

import Explore from './Explore.js';
import Rest from './Rest.js';
import Play from './Play.js';
import Observe from './Observe.js';

class BehaviorManager {
  constructor(shimeji, options = {}) {
    this.shimeji = shimeji;
    
    // Configuration
    this.idleTimeout = options.idleTimeout || 10000; // 10 seconds
    this.enableIdle = options.enableIdle !== undefined ? options.enableIdle : true;
    
    // Behavior tracking
    this.currentBehavior = null;
    this.behaviors = {};
    this.behaviorTimer = null;
    this.idleTimer = null;
    this.lastInteractionTime = Date.now();
    
    // Initialize behaviors
    this.initBehaviors();
  }
  
  initBehaviors() {
    // Register standard behaviors
    this.behaviors = {
      explore: new Explore(this.shimeji),
      rest: new Rest(this.shimeji),
      play: new Play(this.shimeji),
      observe: new Observe(this.shimeji)
    };
    
    // Set default behavior weights
    this.behaviorWeights = {
      explore: 40,
      rest: 20,
      play: 20,
      observe: 20
    };
  }
  
  startBehaviorLoop() {
    // Clear any existing timers
    this.stopBehaviorLoop();
    
    // Start the behavior loop
    this.decideNextBehavior();
    
    // Setup idle timer if enabled
    if (this.enableIdle) {
      this.resetIdleTimer();
    }
  }
  
  stopBehaviorLoop() {
    if (this.behaviorTimer) {
      clearTimeout(this.behaviorTimer);
      this.behaviorTimer = null;
    }
    
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    
    // Stop current behavior if any
    this.stopCurrentBehavior();
  }
  
  stopCurrentBehavior() {
    if (this.currentBehavior && this.behaviors[this.currentBehavior]) {
      this.behaviors[this.currentBehavior].stop();
    }
    this.currentBehavior = null;
  }
  
  resetIdleTimer() {
    if (!this.enableIdle) return;
    
    // Clear existing timer
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    
    // Set new timer
    this.idleTimer = setTimeout(() => {
      // If no user interaction for a while, enter idle mode
      const timeElapsed = Date.now() - this.lastInteractionTime;
      if (timeElapsed > this.idleTimeout) {
        this.executeBehavior('rest');
      }
    }, this.idleTimeout);
  }
  
  recordInteraction() {
    this.lastInteractionTime = Date.now();
    this.resetIdleTimer();
  }
  
  decideNextBehavior() {
    // Stop current behavior
    this.stopCurrentBehavior();
    
    // Choose a behavior based on weights
    const behaviorName = this.selectWeightedBehavior();
    
    // Execute the chosen behavior
    this.executeBehavior(behaviorName);
    
    // Schedule next behavior change
    const nextBehaviorTime = this.getRandomBehaviorDuration();
    this.behaviorTimer = setTimeout(() => {
      this.decideNextBehavior();
    }, nextBehaviorTime);
  }
  
  executeBehavior(behaviorName) {
    if (!this.behaviors[behaviorName]) {
      console.warn(`Behavior ${behaviorName} not found`);
      behaviorName = 'idle';
    }
    
    console.info(`Executing behavior: ${behaviorName}`);
    this.currentBehavior = behaviorName;
    
    // Start the behavior
    this.behaviors[behaviorName].start();
  }
  
  selectWeightedBehavior() {
    // Calculate total weight
    let totalWeight = 0;
    for (const [behavior, weight] of Object.entries(this.behaviorWeights)) {
      totalWeight += weight;
    }
    
    // Generate random value
    const random = Math.random() * totalWeight;
    
    // Find behavior based on random value
    let cumulativeWeight = 0;
    for (const [behavior, weight] of Object.entries(this.behaviorWeights)) {
      cumulativeWeight += weight;
      if (random <= cumulativeWeight) {
        return behavior;
      }
    }
    
    // Default fallback
    return 'idle';
  }
  
  getRandomBehaviorDuration() {
    // Return random duration between 5-15 seconds
    return 5000 + Math.random() * 10000;
  }
  
  /**
   * Move the character to a specific position
   */
  moveTo(targetX, targetY, state = 'walking') {
    // Stop current behavior
    this.stopCurrentBehavior();
    
    // Set target position in physics engine
    this.shimeji.physics.setTarget(targetX, targetY);
    
    // Set character state
    this.shimeji.stateManager.setState(state);
    
    // Record this as user interaction
    this.recordInteraction();
    
    // Return a promise that resolves when the movement is complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.shimeji.physics.isMoving) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }
  
  /**
   * Make character jump
   */
  jump() {
    this.shimeji.physics.jump();
    this.shimeji.stateManager.setState('jumping');
    
    // Record this as user interaction
    this.recordInteraction();
    
    // Return to idle after jump animation completes
    setTimeout(() => {
      if (this.shimeji.stateManager.currentState === 'jumping') {
        this.shimeji.stateManager.setState('idle');
      }
    }, 1000);
  }
  
  /**
   * Make character crawl
   */
  crawl() {
    this.shimeji.stateManager.setState('crawling');
    
    // Record this as user interaction
    this.recordInteraction();
  }
}

export default BehaviorManager; 