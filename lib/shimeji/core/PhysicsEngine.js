/**
 * PhysicsEngine - Handles physics calculations for Shimeji movement
 */

class PhysicsEngine {
  constructor(options = {}) {
    // Physics constants
    this.gravity = options.gravity || 0.8;
    this.friction = options.friction || 0.8;
    this.walkSpeed = options.walkSpeed || 1.5;
    this.dragSpeed = options.dragSpeed || 5;
    this.fallSpeed = options.fallSpeed || 15;
    this.jumpHeight = options.jumpHeight || -12;
    
    // Movement state
    this.vx = 0; // Horizontal velocity
    this.vy = 0; // Vertical velocity
    this.isMoving = false;
    this.isDragging = false;
    this.isJumping = false;
    this.direction = 'right';
    
    // Position
    this.x = 0;
    this.y = 0;
    this.targetX = null;
    this.targetY = null;
  }
  
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  
  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
    this.isMoving = true;
  }
  
  clearTarget() {
    this.targetX = null;
    this.targetY = null;
    this.isMoving = false;
  }
  
  startDrag() {
    this.isDragging = true;
    this.isMoving = false;
    this.clearTarget();
  }
  
  stopDrag() {
    this.isDragging = false;
  }
  
  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.vy = this.jumpHeight;
    }
  }
  
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
    } else if (this.vx < -0.1) {
      this.direction = 'left';
    }
    
    // Check if we've landed
    if (this.y >= window.innerHeight - 100) { // Adjust based on character height
      this.y = window.innerHeight - 100;
      this.vy = 0;
      this.isJumping = false;
    }
    
    return {
      x: this.x,
      y: this.y,
      direction: this.direction,
      isMoving: this.isMoving,
      isDragging: this.isDragging,
      isJumping: this.isJumping
    };
  }
  
  moveTowardTarget() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) {
      // Target reached
      this.clearTarget();
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
  
  // Helper function for easing animations
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
}

export default PhysicsEngine; 