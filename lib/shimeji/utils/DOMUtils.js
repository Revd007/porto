/**
 * DOMUtils - Utilities for DOM manipulation related to Shimeji
 */

const DOMUtils = {
  /**
   * Create the container element for Shimeji
   */
  createContainer(id = 'shimeji-container') {
    // Create container if it doesn't exist
    const existingContainer = document.getElementById(id);
    if (existingContainer) {
      return existingContainer;
    }
    
    const container = document.createElement('div');
    container.id = id;
    container.className = 'shimeji-container';
    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.left = '0';
    container.style.width = '100px';
    container.style.height = '100px';
    container.style.zIndex = '9999';
    container.style.cursor = 'pointer';
    container.style.transition = 'all 0.3s ease';
    container.style.userSelect = 'none';
    container.style.pointerEvents = 'auto';
    container.style.willChange = 'transform';
    container.style.backfaceVisibility = 'hidden';
    container.style.transform = 'translateZ(0)';
    container.style.webkitTransform = 'translateZ(0)';
    container.style.display = 'none'; // Start hidden until image loads
    
    document.body.appendChild(container);
    
    return container;
  },
  
  /**
   * Create the character elements inside the container
   */
  createElements(container, characterName = 'shime') {
    // Create image element if it doesn't exist
    let imageElement = container.querySelector('.shimeji-character');
    if (!imageElement) {
      imageElement = document.createElement('img');
      imageElement.className = 'shimeji-character';
      imageElement.alt = characterName;
      imageElement.style.width = '100%';
      imageElement.style.height = '100%';
      imageElement.style.objectFit = 'contain';
      imageElement.style.imageRendering = 'crisp-edges';
      imageElement.style.transition = 'all 0.3s ease';
      imageElement.style.willChange = 'transform';
      imageElement.style.backfaceVisibility = 'hidden';
      imageElement.style.transform = 'translateZ(0)';
      imageElement.style.webkitTransform = 'translateZ(0)';
      imageElement.style.filter = 'drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3))';
      
      container.appendChild(imageElement);
    }
    
    // Create dialogue bubble if it doesn't exist
    let dialogueElement = container.querySelector('.shimeji-dialogue');
    if (!dialogueElement) {
      dialogueElement = document.createElement('div');
      dialogueElement.className = 'shimeji-dialogue';
      dialogueElement.style.position = 'absolute';
      dialogueElement.style.bottom = '100%';
      dialogueElement.style.left = '50%';
      dialogueElement.style.transform = 'translateX(-50%)';
      dialogueElement.style.backgroundColor = 'white';
      dialogueElement.style.padding = '10px 15px';
      dialogueElement.style.borderRadius = '15px';
      dialogueElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      dialogueElement.style.maxWidth = '250px';
      dialogueElement.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
      dialogueElement.style.fontSize = '14px';
      dialogueElement.style.lineHeight = '1.4';
      dialogueElement.style.color = '#333';
      dialogueElement.style.zIndex = '10000';
      dialogueElement.style.display = 'none';
      dialogueElement.style.pointerEvents = 'none';
      dialogueElement.style.transition = 'opacity 0.3s ease';
      
      // Add a little triangle at the bottom of the bubble
      const triangle = document.createElement('div');
      triangle.style.position = 'absolute';
      triangle.style.bottom = '-8px';
      triangle.style.left = '50%';
      triangle.style.transform = 'translateX(-50%)';
      triangle.style.width = '0';
      triangle.style.height = '0';
      triangle.style.borderLeft = '8px solid transparent';
      triangle.style.borderRight = '8px solid transparent';
      triangle.style.borderTop = '8px solid white';
      
      dialogueElement.appendChild(triangle);
      container.appendChild(dialogueElement);
    }
    
    // Show container when image loads
    imageElement.onload = () => {
      container.style.display = 'block';
    };
    
    // Set initial image
    imageElement.src = `./assets/shimeji/${characterName}.png`;
    
    return { imageElement, dialogueElement };
  },
  
  /**
   * Add event listeners to container
   */
  addEventListeners(shimeji) {
    const container = shimeji.container;
    if (!container) return;
    
    // Drag functionality
    let isDragging = false;
    let offsetX, offsetY;
    
    // Mouse events
    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    // Touch events for mobile
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Double click/tap to jump
    container.addEventListener('dblclick', handleDoubleClick);
    
    // Click/tap to show dialogue
    container.addEventListener('click', handleClick);
    
    function handleMouseDown(e) {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    }
    
    function handleMouseUp() {
      endDrag();
    }
    
    function handleMouseMove(e) {
      if (isDragging) {
        drag(e.clientX, e.clientY);
      }
    }
    
    function handleTouchStart(e) {
      e.preventDefault();
      if (e.touches.length === 1) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    }
    
    function handleTouchEnd() {
      endDrag();
    }
    
    function handleTouchMove(e) {
      if (isDragging && e.touches.length === 1) {
        e.preventDefault();
        drag(e.touches[0].clientX, e.touches[0].clientY);
      }
    }
    
    function handleDoubleClick(e) {
      e.preventDefault();
      
      // Make character jump
      if (shimeji.behaviorManager && typeof shimeji.behaviorManager.jump === 'function') {
        shimeji.behaviorManager.jump();
      }
    }
    
    function handleClick(e) {
      // Single click/tap that wasn't part of a drag
      if (!isDragging && shimeji.dialogue) {
        const randomResponses = [
          "Hello! Need something?",
          "Hi there! How can I help?",
          "What's up? Need assistance with the portfolio?",
          "Oh! You clicked me. How can I assist you?"
        ];
        
        // Get a random response
        const randomResponse = randomResponses[Math.floor(Math.random() * randomResponses.length)];
        
        // Show dialogue with the response
        shimeji.dialogue.showDialogue('click', randomResponse);
      }
    }
    
    function startDrag(clientX, clientY) {
      isDragging = true;
      
      // Calculate offset from cursor/finger to container position
      const rect = container.getBoundingClientRect();
      offsetX = clientX - rect.left;
      offsetY = clientY - rect.top;
      
      // Add dragging class for styling
      container.classList.add('dragging');
      
      // Notify physics engine
      if (shimeji.physics) {
        shimeji.physics.startDrag();
      }
      
      // Change state to dragging
      if (shimeji.stateManager) {
        shimeji.stateManager.setState('surprised');
      }
    }
    
    function drag(clientX, clientY) {
      if (!isDragging) return;
      
      // Calculate new position
      const newX = clientX - offsetX;
      const newY = clientY - offsetY;
      
      // Update container position
      container.style.left = `${newX}px`;
      container.style.top = `${newY}px`;
      
      // Update physics engine position
      if (shimeji.physics) {
        shimeji.physics.setPosition(newX, newY);
      }
    }
    
    function endDrag() {
      if (!isDragging) return;
      
      isDragging = false;
      
      // Remove dragging class
      container.classList.remove('dragging');
      
      // Notify physics engine
      if (shimeji.physics) {
        shimeji.physics.stopDrag();
      }
      
      // Change state back to idle
      if (shimeji.stateManager) {
        shimeji.stateManager.setState('idle');
      }
    }
    
    // Store event handler references for cleanup
    shimeji._eventHandlers = {
      handleMouseDown,
      handleMouseUp,
      handleMouseMove,
      handleTouchStart,
      handleTouchEnd,
      handleTouchMove,
      handleDoubleClick,
      handleClick
    };
  },
  
  /**
   * Remove event listeners
   */
  removeEventListeners(shimeji) {
    const container = shimeji.container;
    if (!container) return;
    
    // Get stored event handlers
    const {
      handleMouseDown,
      handleMouseUp,
      handleMouseMove,
      handleTouchStart,
      handleTouchEnd,
      handleTouchMove,
      handleDoubleClick,
      handleClick
    } = shimeji._eventHandlers || {};
    
    // Remove event listeners
    if (handleMouseDown) {
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    }
    
    if (handleTouchStart) {
      container.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
    }
    
    if (handleDoubleClick) {
      container.removeEventListener('dblclick', handleDoubleClick);
    }
    
    if (handleClick) {
      container.removeEventListener('click', handleClick);
    }
    
    // Clear stored event handlers
    shimeji._eventHandlers = null;
  }
};

export default DOMUtils; 