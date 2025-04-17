/**
 * Rest - Behavior to make character rest and be idle
 */

class Rest {
  constructor(shimeji) {
    this.shimeji = shimeji;
    this.timeout = null;
  }
  
  start() {
    this.stop(); // Clear any existing timeout
    
    // Set idle state
    this.shimeji.stateManager.setState('idle');
    
    // Occasionally show sleeping state
    const shouldSleep = Math.random() < 0.5;
    
    if (shouldSleep) {
      this.timeout = setTimeout(() => {
        this.shimeji.stateManager.setState('sleeping');
        
        // Wake up after a while
        this.timeout = setTimeout(() => {
          this.shimeji.stateManager.setState('idle');
        }, 5000 + Math.random() * 5000);
      }, 2000);
    } else {
      // Show thinking state
      this.timeout = setTimeout(() => {
        this.shimeji.stateManager.setState('thinking');
        
        // And back to idle
        this.timeout = setTimeout(() => {
          this.shimeji.stateManager.setState('idle');
        }, 3000 + Math.random() * 2000);
      }, 2000);
    }
  }
  
  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

export default Rest; 