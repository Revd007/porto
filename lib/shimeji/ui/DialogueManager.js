/**
 * DialogueManager - Handles character dialogue and messages
 */

class DialogueManager {
  constructor(shimeji, options = {}) {
    this.shimeji = shimeji;
    
    // Configuration
    this.autoRespond = options.autoRespond !== undefined ? options.autoRespond : true;
    this.directDialogueMode = options.directDialogueMode !== undefined ? options.directDialogueMode : true;
    
    // Message history
    this.dialogueHistory = [];
    this.currentDialogue = null;
    this.dialogueTimer = null;
    
    // Get dialogue element
    this.dialogueElement = null;
  }
  
  /**
   * Display a dialogue message
   */
  showDialogue(context, message = null, duration = 4000) {
    // Get dialogue element if not already set
    if (!this.dialogueElement) {
      this.dialogueElement = this.shimeji.container.querySelector('.shimeji-dialogue');
      if (!this.dialogueElement) return;
    }
    
    // Clear any existing timer
    if (this.dialogueTimer) {
      clearTimeout(this.dialogueTimer);
      this.dialogueTimer = null;
    }
    
    // If no message provided, get contextual dialogue
    if (!message) {
      message = this.getContextualDialogue(context);
    }
    
    // Add to dialogue history
    this.addToDialogueHistory(context, message);
    
    // Set dialogue content
    this.dialogueElement.textContent = message;
    
    // Show dialogue
    this.dialogueElement.style.display = 'block';
    this.dialogueElement.style.opacity = '1';
    
    // Set current dialogue
    this.currentDialogue = {
      context,
      message,
      timestamp: Date.now()
    };
    
    // Hide dialogue after duration
    this.dialogueTimer = setTimeout(() => {
      this.hideDialogue();
    }, duration);
    
    return message;
  }
  
  /**
   * Hide the dialogue bubble
   */
  hideDialogue() {
    if (!this.dialogueElement) return;
    
    // Fade out
    this.dialogueElement.style.opacity = '0';
    
    // Hide after transition
    setTimeout(() => {
      this.dialogueElement.style.display = 'none';
    }, 300);
    
    this.currentDialogue = null;
  }
  
  /**
   * Add dialogue to history
   */
  addToDialogueHistory(context, message) {
    this.dialogueHistory.push({
      context,
      message,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.dialogueHistory.length > 10) {
      this.dialogueHistory.shift();
    }
  }
  
  /**
   * Get contextual dialogue based on context
   */
  getContextualDialogue(context) {
    // Default dialogues for different contexts
    const dialogues = {
      welcome: this.getWelcomeMessage(),
      idle: [
        "Just hanging out here!",
        "Looking at this awesome portfolio...",
        "Anything I can help you with?",
        "Feel free to explore the projects!"
      ],
      click: [
        "Hello! Need something?",
        "Hi there! Need some help?",
        "What's up?",
        "Oh, you clicked me!"
      ],
      link: [
        "That's an interesting link!",
        "Want to check that out?",
        "Click it to find out more!"
      ],
      button: [
        "That's a button. Try clicking it!",
        "Buttons are fun to press!",
        "Wonder what this button does..."
      ],
      input: [
        "You can type something here.",
        "Need to enter some information?",
        "This is where you can input your details."
      ],
      contact: [
        "Want to get in touch? Fill out this form!",
        "I'll make sure your message gets delivered!",
        "This contact form is the best way to reach out."
      ],
      project: [
        "This project looks amazing!",
        "Check out the details of this project.",
        "This is one of the portfolio highlights!"
      ],
      skill: [
        "That's one of the key skills!",
        "This technology was used in several projects.",
        "There's a lot of experience with this skill."
      ],
      observe: [
        "Hmm, interesting...",
        "Just looking around.",
        "I wonder what this does."
      ]
    };
    
    // Get dialogue array for the given context
    const contextDialogues = dialogues[context] || dialogues.idle;
    
    // Return a random dialogue from the array
    return this.getRandomResponse(contextDialogues);
  }
  
  /**
   * Get a random response from an array
   */
  getRandomResponse(responses) {
    if (!Array.isArray(responses) || responses.length === 0) {
      return "Hello!";
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  /**
   * Get welcome message based on time of day
   */
  getWelcomeMessage() {
    const timeOfDay = this.getTimeOfDay();
    
    const welcomeMessages = {
      morning: [
        "Good morning! Welcome to the portfolio!",
        "Rise and shine! Ready to explore?",
        "Morning! Let's discover some projects today!"
      ],
      afternoon: [
        "Good afternoon! Welcome to the portfolio!",
        "Hello there! How's your day going?",
        "Afternoon! Let's check out some work!"
      ],
      evening: [
        "Good evening! Welcome to the portfolio!",
        "Hello! Looking for some inspiration tonight?",
        "Evening! Thanks for stopping by!"
      ],
      night: [
        "Working late? Welcome to the portfolio!",
        "Night owl, huh? Let's explore together!",
        "Thanks for visiting! Even at this hour!"
      ]
    };
    
    return this.getRandomResponse(welcomeMessages[timeOfDay]);
  }
  
  /**
   * Get time of day
   */
  getTimeOfDay() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 17) {
      return 'afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'evening';
    } else {
      return 'night';
    }
  }
  
  /**
   * Get fallback response
   */
  getFallbackResponse(language = 'en') {
    const fallbacks = {
      en: "I'm here to help with any questions about the portfolio.",
      id: "Saya di sini untuk membantu dengan pertanyaan tentang portofolio ini.",
      ja: "ポートフォリオについての質問を手伝うためにここにいます。"
    };
    
    return fallbacks[language] || fallbacks.en;
  }
}

export default DialogueManager; 