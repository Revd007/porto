/**
 * Observe - Behavior to make character observe the screen and user activity
 */

class Observe {
  constructor(shimeji) {
    this.shimeji = shimeji;
    this.timeout = null;
    this.observationPoints = [];
  }
  
  start() {
    this.stop(); // Clear any existing timeout
    
    // Set initial thinking state
    this.shimeji.stateManager.setState('thinking');
    
    // Find interesting elements to observe
    this.findObservationPoints();
    
    // Move to a random observation point
    this.observeRandomPoint();
  }
  
  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
  
  findObservationPoints() {
    this.observationPoints = [];
    
    // Find interactive elements on the page
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, [role="button"]');
    
    // Convert to array of coordinates
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0) {
        this.observationPoints.push({
          x: rect.left,
          y: rect.top,
          element: element
        });
      }
    });
    
    // Add some random screen positions if we don't have enough elements
    if (this.observationPoints.length < 3) {
      for (let i = 0; i < 5; i++) {
        this.observationPoints.push({
          x: Math.random() * (window.innerWidth - 100),
          y: Math.random() * (window.innerHeight - 100),
          element: null
        });
      }
    }
  }
  
  observeRandomPoint() {
    // If no observation points, find some
    if (this.observationPoints.length === 0) {
      this.findObservationPoints();
      
      // If still none, fallback to idle
      if (this.observationPoints.length === 0) {
        this.shimeji.stateManager.setState('idle');
        return;
      }
    }
    
    // Choose a random point
    const pointIndex = Math.floor(Math.random() * this.observationPoints.length);
    const point = this.observationPoints[pointIndex];
    
    // Move to the observation point
    this.shimeji.physics.setTarget(point.x, point.y);
    this.shimeji.stateManager.setState('walking');
    
    // Once we arrive, observe
    this.timeout = setTimeout(() => {
      // Show thinking or surprised emotion
      const emotion = Math.random() < 0.7 ? 'thinking' : 'surprised';
      this.shimeji.stateManager.setState(emotion);
      
      // If this is observing an element, maybe show a comment
      if (point.element && Math.random() < 0.3) {
        this.commentOnElement(point.element);
      }
      
      // After observing, move to another point
      this.timeout = setTimeout(() => {
        // Remove this point from the list so we don't observe it again right away
        this.observationPoints.splice(pointIndex, 1);
        
        // Observe another point
        this.observeRandomPoint();
      }, 2000 + Math.random() * 3000);
    }, 1000);
  }
  
  commentOnElement(element) {
    let context = 'observe';
    let message = null;
    
    // Determine element type and generate appropriate message
    if (element.tagName === 'A') {
      context = 'link';
      message = "That's an interesting link!";
    } else if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
      context = 'button';
      message = "I wonder what this button does...";
    } else if (element.tagName === 'INPUT') {
      context = 'input';
      const inputType = element.type.toLowerCase();
      
      if (inputType === 'text' || inputType === 'email') {
        message = "You can type something here!";
      } else if (inputType === 'submit') {
        message = "This will submit the form.";
      }
    } else if (element.tagName === 'TEXTAREA') {
      context = 'input';
      message = "You can write a longer message here.";
    }
    
    // Show dialogue with comment
    if (message) {
      this.shimeji.showDialogue(context, message);
    }
  }
}

export default Observe; 