# Shimeji Module

A modular implementation of the Shimeji interactive character for web pages.

## Directory Structure

```
lib/shimeji/
├── index.js                 # Main entry point
├── core/                    # Core functionality
│   ├── Shimeji.js           # Main Shimeji class
│   ├── PhysicsEngine.js     # Physics calculations
│   ├── StateManager.js      # Character state management
│   └── AIAgent.js           # AI capabilities
├── behaviors/               # Character behaviors
│   ├── BehaviorManager.js   # Behavior coordination
│   ├── Explore.js           # Exploration behavior
│   ├── Rest.js              # Resting behavior
│   ├── Play.js              # Play behavior
│   └── Observe.js           # Observation behavior
├── utils/                   # Utility functions
│   └── DOMUtils.js          # DOM manipulation utilities
├── ui/                      # User interface components
│   ├── UIManager.js         # UI coordination
│   ├── DialogueManager.js   # Dialogue and messages
│   └── ContactForm.js       # Contact form integration
└── security/                # Security features
    └── SecurityManager.js   # Anti-inspection measures
```

## Usage

```html
<!-- Basic usage -->
<script type="module">
  import Shimeji from './lib/shimeji/index.js';
  
  document.addEventListener('DOMContentLoaded', () => {
    const myShimeji = new Shimeji({
      characterName: 'hutao',
      imgPath: './assets/shimeji/'
    });
  });
</script>

<!-- Auto-initialization with data attributes -->
<div data-shimeji-auto-init
     data-shimeji-character-name="hutao"
     data-shimeji-img-path="./assets/shimeji/">
</div>
```

## Configuration Options

The Shimeji constructor accepts various options to customize behavior:

```javascript
const options = {
  // Basic configuration
  elementId: 'shimeji-container',  // DOM element ID for the container
  characterName: 'hutao',          // Character name (folder name in imgPath)
  language: 'en',                  // Default language ('en', 'id', 'ja', etc.)
  imgPath: './assets/shimeji/',    // Path to character assets
  
  // Physics settings
  gravity: 0.8,                    // Gravity strength
  friction: 0.8,                   // Friction coefficient
  walkSpeed: 1.5,                  // Walking speed
  dragSpeed: 5,                    // Dragging speed
  fallSpeed: 15,                   // Initial falling speed
  jumpHeight: -12,                 // Jump height (negative values jump up)
  
  // Behavior settings
  idleTimeout: 10000,              // Time before idle behavior (ms)
  enableIdle: true,                // Enable idle behavior
  
  // AI and dialogue settings
  chatEnabled: true,               // Enable chat functionality
  autoRespond: true,               // Auto-respond to questions
  directDialogueMode: true,        // Enable direct dialogue
  
  // Contact form settings
  recipientEmail: '',              // Recipient email for contact form
  enableShimejiNotification: true, // Show notification after form submission
}
```

## API

The Shimeji instance provides several methods for interaction:

```javascript
// Show an emotion
myShimeji.showEmotion('happy');  // Options: happy, surprised, thinking, etc.

// Show a dialogue
myShimeji.showDialogue('context', 'Your message here', 5000);  // Context, message, duration

// Move to a position
myShimeji.moveTo(100, 200, 'walking');  // x, y, state

// Set up contact form
myShimeji.setupContactForm({
  recipientEmail: 'your@email.com',
  enableShimejiNotification: true
});

// Clean up
myShimeji.cleanup();  // Remove event listeners and elements
```

## Assets Structure

Character assets should be organized as follows:

```
assets/shimeji/
└── hutao/              # Character folder (matches characterName)
    ├── idle.png        # Default state
    ├── walking.png     # Walking state
    ├── running.png     # Running state
    ├── jumping.png     # Jumping state
    ├── happy.png       # Happy emotion
    ├── surprised.png   # Surprised emotion
    ├── thinking.png    # Thinking emotion
 