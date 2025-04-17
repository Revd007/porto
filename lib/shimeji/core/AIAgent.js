/**
 * AIAgent - Handles AI capabilities of the Shimeji character
 */

class AIAgent {
  constructor(shimeji, options = {}) {
    this.shimeji = shimeji;
    
    // Configuration
    this.chatEnabled = options.chatEnabled !== undefined ? options.chatEnabled : true;
    this.nlpEnabled = options.nlpEnabled !== undefined ? options.nlpEnabled : true;
    this.languageDetectionEnabled = options.languageDetectionEnabled !== undefined ? options.languageDetectionEnabled : true;
    this.adaptiveModeEnabled = options.adaptiveModeEnabled !== undefined ? options.adaptiveModeEnabled : true;
    
    // Language and memory
    this.language = shimeji.language || 'en';
    this.memory = {
      interactions: [],
      topics: {},
      userPreferences: {},
      contextual: {}
    };
    
    // NLP capabilities
    this.model = null;
    this.encoder = null;
    this.initialized = false;
    
    // Initialize AI components if enabled
    if (this.nlpEnabled) {
      this.initializeAI();
    }
  }
  
  async initializeAI() {
    if (typeof window === 'undefined') return;
    
    try {
      // In a real implementation, we would load TensorFlow.js and models here
      // For simplicity, we'll use a mock implementation
      this.encoder = this.createMockEncoder();
      this.model = this.createMockModel();
      this.initialized = true;
      
      console.info('AI capabilities initialized');
    } catch (error) {
      console.warn('Failed to initialize AI capabilities:', error);
      this.nlpEnabled = false;
    }
  }
  
  createMockEncoder() {
    // Mock implementation of a text encoder
    return {
      encode: (text) => {
        // Simple tokenization for demonstration
        return text.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(token => token.length > 0);
      }
    };
  }
  
  createMockModel() {
    // Mock implementation of an NLP model
    return {
      predict: (tokens) => {
        // Simplified intent recognition based on keywords
        const intents = {
          greeting: ['hello', 'hi', 'hey', 'greetings', 'howdy'],
          farewell: ['bye', 'goodbye', 'see you', 'later'],
          help: ['help', 'assist', 'support', 'how to', 'tutorial'],
          about: ['about', 'who', 'what', 'info', 'information'],
          contact: ['contact', 'email', 'reach', 'message', 'form'],
          project: ['project', 'work', 'portfolio', 'showcase', 'example'],
          skill: ['skill', 'ability', 'can', 'know', 'react', 'angular', 'javascript', 'typescript', 'frontend', 'programming']
        };
        
        // Check tokens against intents
        const intentMatches = {};
        
        for (const [intent, keywords] of Object.entries(intents)) {
          const matches = tokens.filter(token => keywords.includes(token));
          if (matches.length > 0) {
            intentMatches[intent] = matches.length / tokens.length;
          }
        }
        
        // Find the highest confidence intent
        const entries = Object.entries(intentMatches);
        if (entries.length === 0) {
          return { intent: 'unknown', confidence: 0, entities: [] };
        }
        
        entries.sort((a, b) => b[1] - a[1]);
        const [intent, confidence] = entries[0];
        
        // Extract potential entities
        const entities = this.extractEntities(tokens, intent);
        
        return { intent, confidence, entities };
      }
    };
  }
  
  extractEntities(tokens, intent) {
    const entities = [];
    
    // Common skills to recognize
    const skills = [
      'react', 'angular', 'vue', 'svelte', 'javascript', 'typescript',
      'html', 'css', 'tailwind', 'bootstrap', 'material-ui', 'styled-components',
      'redux', 'graphql', 'rest', 'api', 'testing', 'jest', 'cypress',
      'node', 'express', 'next.js', 'webpack', 'git', 'github', 'figma'
    ];
    
    if (intent === 'skill') {
      tokens.forEach(token => {
        if (skills.includes(token)) {
          entities.push({ type: 'skill', value: token });
        }
      });
    } else if (intent === 'project') {
      // Project entities would be extracted here based on known projects
    }
    
    return entities;
  }
  
  handleQuestion(question) {
    if (!this.chatEnabled || !this.initialized) {
      return { 
        response: this.getFallbackResponse(), 
        emotion: 'thinking'
      };
    }
    
    // Detect language if enabled
    if (this.languageDetectionEnabled) {
      this.detectLanguage(question);
    }
    
    // Analyze the question
    const analysis = this.analyzeQuestion(question);
    
    // Generate a response
    const response = this.generateResponse(analysis, question);
    
    // Remember this interaction
    this.rememberInteraction(question, response, analysis);
    
    return response;
  }
  
  detectLanguage(text) {
    // Simple language detection based on common words
    const languages = {
      en: ['the', 'is', 'are', 'what', 'who', 'where', 'when', 'why', 'how', 'hello', 'hi'],
      id: ['apa', 'siapa', 'dimana', 'kapan', 'mengapa', 'bagaimana', 'halo', 'hai', 'adalah', 'itu'],
      ja: ['は', 'です', 'ます', 'こんにちは', 'おはよう', '何', 'どこ', 'だれ', 'いつ', 'なぜ'],
    };
    
    // Count language matches
    const counts = {};
    const lowerText = text.toLowerCase();
    
    for (const [lang, words] of Object.entries(languages)) {
      counts[lang] = words.filter(word => lowerText.includes(word)).length;
    }
    
    // Find the language with the most matches
    let maxLang = 'en';
    let maxCount = 0;
    
    for (const [lang, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxLang = lang;
        maxCount = count;
      }
    }
    
    // Update language if we have a match
    if (maxCount > 0) {
      this.language = maxLang;
    }
    
    return this.language;
  }
  
  analyzeQuestion(question) {
    if (!this.initialized || !this.encoder || !this.model) {
      return { intent: 'unknown', confidence: 0, entities: [] };
    }
    
    const tokens = this.encoder.encode(question);
    return this.model.predict(tokens);
  }
  
  generateResponse(analysis, question) {
    const { intent, confidence, entities } = analysis;
    
    // Get the appropriate emotion for this intent
    const emotion = this.getEmotionForIntent(intent);
    
    // Get the appropriate response template
    const templates = this.getResponseTemplates(intent, this.language);
    
    if (!templates || templates.length === 0) {
      return {
        response: this.getFallbackResponse(this.language),
        emotion: 'thinking'
      };
    }
    
    // Select a random template
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Fill in template with entities
    let response = this.fillTemplate(template, entities, question);
    
    // Add relevant memory if available
    response = this.enhanceWithMemory(response, question, intent, entities);
    
    // Generate a follow-up suggestion if confidence is high
    if (confidence > 0.7) {
      const followUp = this.generateFollowUp(intent, entities);
      if (followUp) {
        response += ` ${followUp}`;
      }
    }
    
    return {
      response,
      emotion,
      intent,
      entities
    };
  }
  
  fillTemplate(template, entities, question) {
    let filledTemplate = template;
    
    // Replace entity placeholders
    if (entities.length > 0) {
      for (const entity of entities) {
        filledTemplate = filledTemplate.replace(`{${entity.type}}`, entity.value);
      }
    }
    
    // Replace question placeholder
    filledTemplate = filledTemplate.replace('{question}', question);
    
    // Replace any remaining placeholders
    filledTemplate = filledTemplate.replace(/\{[^}]+\}/g, '...');
    
    return filledTemplate;
  }
  
  enhanceWithMemory(response, question, intent, entities) {
    // Implementation would use the memory system to enhance responses
    // but for simplicity we'll just return the original response
    return response;
  }
  
  generateFollowUp(intent, entities) {
    // Templates for follow-up questions
    const followUps = {
      en: {
        greeting: "Is there something you'd like to know about the portfolio?",
        about: "Would you like to know about my experience or skills?",
        skill: "Would you like to see projects that use this technology?",
        project: "Would you like to see the code or a live demo?",
        contact: "Do you have any other questions before sending a message?"
      }
    };
    
    // Get follow-ups for the current language or fall back to English
    const langFollowUps = followUps[this.language] || followUps.en;
    
    return langFollowUps[intent] || null;
  }
  
  getEmotionForIntent(intent) {
    // Map intents to emotions
    const emotions = {
      greeting: 'happy',
      farewell: 'sad',
      help: 'thinking',
      about: 'happy',
      contact: 'excited',
      project: 'proud',
      skill: 'confident',
      unknown: 'surprised'
    };
    
    return emotions[intent] || 'neutral';
  }
  
  getResponseTemplates(intent, language = 'en') {
    // Response templates for various intents and languages
    const templates = {
      en: {
        greeting: [
          "Hello! Nice to meet you. I'm Shimeji, your portfolio guide.",
          "Hi there! I'm here to help you explore this portfolio.",
          "Hey! Welcome to the portfolio. How can I assist you today?"
        ],
        farewell: [
          "Goodbye! It was nice chatting with you.",
          "See you later! Feel free to return if you have more questions.",
          "Bye for now! Have a great day!"
        ],
        help: [
          "I can help you learn about skills, projects, or contact information. What would you like to know?",
          "You can ask me about the portfolio, skills, or projects. What are you interested in?",
          "I'm here to guide you through the portfolio. What would you like to explore?"
        ],
        about: [
          "This portfolio showcases frontend development expertise with React, Angular, and modern web technologies.",
          "You're looking at a showcase of frontend development work, featuring projects built with various JavaScript frameworks.",
          "This is a portfolio highlighting skills in frontend development, UI/UX design, and modern web technologies."
        ],
        contact: [
          "You can use the contact form below to get in touch. I'll make sure your message gets delivered!",
          "The contact form at the bottom of the page is the best way to reach out.",
          "Feel free to send a message through the contact form, and you'll get a response soon."
        ],
        project: [
          "There are several exciting projects in this portfolio. Any specific one you'd like to know about?",
          "The portfolio includes various frontend projects. Which one interests you?",
          "You can find projects ranging from web applications to UI components. Which would you like to explore?"
        ],
        skill: [
          "Yes, {skill} is definitely one of the key skills! Would you like to see projects that use it?",
          "{skill} is a great technology that was used in several projects here.",
          "There's solid experience with {skill} demonstrated in this portfolio."
        ],
        unknown: [
          "I'm not sure I understand. Could you rephrase your question?",
          "I'm still learning! Could you ask that in a different way?",
          "I didn't quite catch that. Can you ask something about the portfolio, skills, or projects?"
        ]
      },
      // Could add other languages here
    };
    
    // Get templates for the current language or fall back to English
    const langTemplates = templates[language] || templates.en;
    
    return langTemplates[intent] || langTemplates.unknown;
  }
  
  getFallbackResponse(language = 'en') {
    const fallbacks = {
      en: "I'm here to help with any questions about the portfolio.",
      id: "Saya di sini untuk membantu dengan pertanyaan tentang portofolio ini.",
      ja: "ポートフォリオについての質問を手伝うためにここにいます。"
    };
    
    return fallbacks[language] || fallbacks.en;
  }
  
  rememberInteraction(question, response, analysis) {
    const { intent, entities } = analysis;
    
    // Store the interaction in memory
    this.memory.interactions.push({
      timestamp: new Date().toISOString(),
      question,
      response: response.response,
      intent,
      entities,
      language: this.language
    });
    
    // Limit memory size
    if (this.memory.interactions.length > 10) {
      this.memory.interactions.shift();
    }
    
    // Track topic interest
    if (intent !== 'unknown') {
      this.memory.topics[intent] = (this.memory.topics[intent] || 0) + 1;
    }
    
    // Track entity interest
    for (const entity of entities) {
      const key = `${entity.type}:${entity.value}`;
      this.memory.contextual[key] = (this.memory.contextual[key] || 0) + 1;
    }
  }
  
  setAdaptiveMode(enabled) {
    this.adaptiveModeEnabled = enabled;
  }
}

export default AIAgent; 