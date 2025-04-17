/**
 * Play - Behavior to make character play around
 */

class Play {
  constructor(shimeji) {
    this.shimeji = shimeji;
    this.interval = null;
    this.emotionInterval = null;
  }
  
  start() {
    this.stop(); // Clear any existing intervals
    
    // Start with happy state
    this.shimeji.stateManager.setState('happy');
    
    // Set interval to perform playful actions
    this.interval = setInterval(() => {
      this.performPlayfulAction();
    }, 2000 + Math.random() * 2000);
    
    // Cycle through happy emotions
    this.emotionInterval = setInterval(() => {
      // 50% chance to show a happy emotion
      if (Math.random() < 0.5) {
        this.shimeji.stateManager.showEmotion('happy');
      }
    }, 3000 + Math.random() * 3000);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    if (this.emotionInterval) {
      clearInterval(this.emotionInterval);
      this.emotionInterval = null;
    }
  }
  
  performPlayfulAction() {
    // Choose a random playful action
    const actions = ['jump', 'dance', 'wave', 'spin'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    switch (randomAction) {
      case 'jump':
        this.shimeji.behaviorManager.jump();
        break;
        
      case 'dance':
        this.shimeji.stateManager.setState('happy');
        // Move side to side
        setTimeout(() => {
          if (this.shimeji.physics.direction === 'left') {
            this.shimeji.physics.vx = 2;
          } else {
            this.shimeji.physics.vx = -2;
          }
        }, 300);
        break;
        
      case 'wave':
        this.shimeji.stateManager.setState('waving');
        setTimeout(() => {
          this.shimeji.stateManager.setState('happy');
        }, 1500);
        break;
        
      case 'spin':
        // Simulate spinning by rapidly changing direction
        let count = 0;
        const spinInterval = setInterval(() => {
          this.shimeji.physics.direction = this.shimeji.physics.direction === 'left' ? 'right' : 'left';
          this.shimeji.stateManager.updateCharacterOrientation();
          count++;
          
          if (count >= 6) {
            clearInterval(spinInterval);
            this.shimeji.stateManager.setState('surprised'); // Dizzy after spinning
            
            setTimeout(() => {
              this.shimeji.stateManager.setState('happy');
            }, 1000);
          }
        }, 150);
        break;
    }
  }
}

export default Play; 