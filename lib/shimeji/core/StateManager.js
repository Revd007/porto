/**
 * StateManager - Handles character states and animations
 */

class StateManager {
  constructor(shimeji) {
    this.shimeji = shimeji;
    
    // State tracking
    this.currentState = 'idle';
    this.lastSuccessfulState = 'idle';
    this.currentEmotion = null;
    this.animationFrame = null;
    this.frameIndex = 0;
    
    // Animation settings
    this.frameRate = 100; // ms per frame
    this.lastFrameTime = 0;
    
    // Character state configuration
    this.states = {
      idle: { frames: 4, loop: true },
      walking: { frames: 8, loop: true },
      running: { frames: 8, loop: true },
      jumping: { frames: 6, loop: false },
      falling: { frames: 4, loop: true },
      sitting: { frames: 4, loop: true },
      sleeping: { frames: 4, loop: true },
      happy: { frames: 4, loop: true },
      surprised: { frames: 4, loop: true },
      thinking: { frames: 4, loop: true },
    };
    
    // Image element reference
    this.imageElement = null;
  }
  
  setState(newState) {
    if (!this.states[newState]) {
      console.warn(`State "${newState}" not found, defaulting to idle`);
      newState = 'idle';
    }
    
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.frameIndex = 0;
      this.lastFrameTime = 0;
      
      // Update CSS class on container for animation
      this.updateContainerClass();
      
      // Try to load the corresponding image for this state
      this.loadStateImage();
    }
    
    return newState;
  }
  
  showEmotion(emotion) {
    // Store previous state to return to after emotion display
    const previousState = this.currentState;
    
    // Set emotion state for a short duration
    this.setState(emotion);
    this.currentEmotion = emotion;
    
    // Return to previous state after a delay
    setTimeout(() => {
      if (this.currentEmotion === emotion) {
        this.currentEmotion = null;
        this.setState(previousState);
      }
    }, 2000); // Display emotion for 2 seconds
  }
  
  updateContainerClass() {
    if (!this.shimeji.container) return;
    
    // Remove all state classes
    Object.keys(this.states).forEach(state => {
      this.shimeji.container.classList.remove(state);
    });
    
    // Add current state class
    this.shimeji.container.classList.add(this.currentState);
  }
  
  loadStateImage() {
    if (!this.imageElement) {
      this.imageElement = this.shimeji.container.querySelector('.shimeji-character');
      if (!this.imageElement) return;
    }
    
    const { characterName, imgPath } = this.shimeji;
    const imageSrc = `${imgPath}${characterName}/${this.currentState}.png`;
    
    // Set image source
    this.imageElement.src = imageSrc;
    
    // Store successful state if image loads
    this.imageElement.onload = () => {
      this.lastSuccessfulState = this.currentState;
    };
    
    // Revert to last successful state if image fails to load
    this.imageElement.onerror = () => {
      console.warn(`Failed to load image for state: ${this.currentState}`);
      
      // Find a similar state or fallback to idle
      const similarState = this.findSimilarState(this.currentState);
      
      if (similarState && similarState !== this.currentState) {
        console.info(`Falling back to similar state: ${similarState}`);
        this.setState(similarState);
      } else if (this.lastSuccessfulState !== 'idle') {
        console.info(`Falling back to last successful state: ${this.lastSuccessfulState}`);
        this.setState(this.lastSuccessfulState);
      } else {
        console.info('Falling back to idle state');
        this.setState('idle');
      }
    };
  }
  
  findSimilarState(stateName) {
    // Try to find a state with a similar name
    const existingStates = Object.keys(this.states);
    
    // Check if state starts with the same prefix
    for (const state of existingStates) {
      if (state !== stateName && (state.startsWith(stateName) || stateName.startsWith(state))) {
        return state;
      }
    }
    
    // If no match, return idle
    return 'idle';
  }
  
  startAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    const animate = (timestamp) => {
      if (!this.lastFrameTime) this.lastFrameTime = timestamp;
      
      const elapsed = timestamp - this.lastFrameTime;
      
      if (elapsed > this.frameRate) {
        this.lastFrameTime = timestamp;
        this.updateFrame();
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
  
  updateFrame() {
    const stateConfig = this.states[this.currentState];
    if (!stateConfig) return;
    
    this.frameIndex++;
    
    // If we've reached the end of the frames
    if (this.frameIndex >= stateConfig.frames) {
      if (stateConfig.loop) {
        // Loop back to beginning
        this.frameIndex = 0;
      } else {
        // Non-looping animation is complete
        this.frameIndex = stateConfig.frames - 1;
        
        // If this was an emotion, return to previous state
        if (this.currentEmotion) {
          this.currentEmotion = null;
          this.setState('idle');
          return;
        }
      }
    }
    
    // Apply transformation to show correct frame
    this.updateSpritePosition();
  }
  
  updateSpritePosition() {
    if (!this.imageElement) return;
    
    // For multiple frame sprites, adjust background position
    // This assumes a sprite sheet with frames arranged horizontally
    if (this.frameIndex > 0) {
      // const offsetX = -this.frameIndex * 100; // Assuming 100px width per frame
      // this.imageElement.style.backgroundPositionX = `${offsetX}px`;
      
      // If using separate images, could update src here instead
      // this.imageElement.src = `${this.shimeji.imgPath}${this.shimeji.characterName}/${this.currentState}_${this.frameIndex}.png`;
    }
  }
  
  updateCharacterOrientation() {
    if (!this.shimeji.container) return;
    
    // Apply flip based on direction
    if (this.shimeji.physics.direction === 'left') {
      this.shimeji.container.style.transform = 'scaleX(-1)';
    } else {
      this.shimeji.container.style.transform = 'scaleX(1)';
    }
  }
}

export default StateManager; 