/**
 * Explore - Behavior to make character explore the screen
 */

class Explore {
  constructor(shimeji) {
    this.shimeji = shimeji;
    this.interval = null;
  }
  
  start() {
    this.stop(); // Clear any existing interval
    
    // Set initial state
    this.shimeji.stateManager.setState('walking');
    
    // Start moving randomly
    this.moveRandomly();
    
    // Set interval to continue exploring
    this.interval = setInterval(() => {
      this.moveRandomly();
    }, 3000 + Math.random() * 2000);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  
  moveRandomly() {
    // Get window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Calculate random position within viewport
    const randomX = Math.random() * (windowWidth - 100);
    const randomY = Math.random() * (windowHeight - 100);
    
    // Occasionally make the character jump instead of walk
    const shouldJump = Math.random() < 0.2;
    
    if (shouldJump) {
      this.shimeji.behaviorManager.jump();
      setTimeout(() => {
        // After landing from the jump, move to the random position
        this.shimeji.physics.setTarget(randomX, randomY);
        this.shimeji.stateManager.setState('walking');
      }, 1000);
    } else {
      // Move to the random position
      this.shimeji.physics.setTarget(randomX, randomY);
      this.shimeji.stateManager.setState('walking');
    }
  }
}

export default Explore; 