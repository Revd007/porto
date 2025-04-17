/**
 * UIManager - Manages UI elements for Shimeji
 */

class UIManager {
  constructor(shimeji) {
    this.shimeji = shimeji;
    this.chatInterface = null;
    this.chatMessages = [];
    this.isVisible = false;
  }
  
  /**
   * Create and show a popup message
   */
  showPopup(message, type = 'info', duration = 3000) {
    // Create popup element if it doesn't exist
    let popupElement = document.querySelector('.shimeji-popup');
    if (!popupElement) {
      popupElement = document.createElement('div');
      popupElement.className = 'shimeji-popup';
      popupElement.style.position = 'fixed';
      popupElement.style.bottom = '20px';
      popupElement.style.right = '20px';
      popupElement.style.backgroundColor = 'white';
      popupElement.style.padding = '15px';
      popupElement.style.borderRadius = '5px';
      popupElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      popupElement.style.maxWidth = '300px';
      popupElement.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
      popupElement.style.fontSize = '14px';
      popupElement.style.lineHeight = '1.4';
      popupElement.style.zIndex = '10001';
      popupElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      popupElement.style.opacity = '0';
      popupElement.style.transform = 'translateY(20px)';
      
      document.body.appendChild(popupElement);
    }
    
    // Set popup content
    popupElement.textContent = message;
    
    // Set popup type styling
    switch (type) {
      case 'success':
        popupElement.style.borderLeft = '4px solid #4caf50';
        break;
      case 'error':
        popupElement.style.borderLeft = '4px solid #f44336';
        break;
      case 'warning':
        popupElement.style.borderLeft = '4px solid #ff9800';
        break;
      default:
        popupElement.style.borderLeft = '4px solid #2196f3';
        break;
    }
    
    // Show popup
    setTimeout(() => {
      popupElement.style.opacity = '1';
      popupElement.style.transform = 'translateY(0)';
    }, 10);
    
    // Hide popup after duration
    const timer = setTimeout(() => {
      popupElement.style.opacity = '0';
      popupElement.style.transform = 'translateY(20px)';
      
      // Remove popup after transition
      setTimeout(() => {
        if (popupElement.parentNode) {
          popupElement.parentNode.removeChild(popupElement);
        }
      }, 300);
    }, duration);
    
    // Allow clicking to dismiss
    popupElement.addEventListener('click', () => {
      clearTimeout(timer);
      popupElement.style.opacity = '0';
      popupElement.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        if (popupElement.parentNode) {
          popupElement.parentNode.removeChild(popupElement);
        }
      }, 300);
    });
  }
  
  /**
   * Create chat interface for direct communication
   */
  createChatInterface() {
    if (this.chatInterface) return;
    
    // Create chat container
    const chatContainer = document.createElement('div');
    chatContainer.className = 'shimeji-chat-container';
    chatContainer.style.position = 'fixed';
    chatContainer.style.bottom = '120px';
    chatContainer.style.right = '20px';
    chatContainer.style.width = '300px';
    chatContainer.style.backgroundColor = 'white';
    chatContainer.style.borderRadius = '10px';
    chatContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    chatContainer.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    chatContainer.style.fontSize = '14px';
    chatContainer.style.zIndex = '10000';
    chatContainer.style.overflow = 'hidden';
    chatContainer.style.display = 'none';
    chatContainer.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    chatContainer.style.transform = 'translateY(20px)';
    chatContainer.style.opacity = '0';
    
    // Create chat header
    const chatHeader = document.createElement('div');
    chatHeader.className = 'shimeji-chat-header';
    chatHeader.style.backgroundColor = '#4361ee';
    chatHeader.style.color = 'white';
    chatHeader.style.padding = '12px 15px';
    chatHeader.style.fontWeight = 'bold';
    chatHeader.style.display = 'flex';
    chatHeader.style.justifyContent = 'space-between';
    chatHeader.style.alignItems = 'center';
    chatHeader.textContent = 'Chat with Shimeji';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => this.toggleChatInterface(false));
    
    chatHeader.appendChild(closeButton);
    
    // Create chat messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'shimeji-chat-messages';
    messagesContainer.style.padding = '15px';
    messagesContainer.style.maxHeight = '250px';
    messagesContainer.style.overflowY = 'auto';
    
    // Create chat input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'shimeji-chat-input';
    inputContainer.style.padding = '10px';
    inputContainer.style.borderTop = '1px solid #eee';
    inputContainer.style.display = 'flex';
    
    // Create chat input
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your message...';
    input.style.width = '100%';
    input.style.padding = '8px 12px';
    input.style.border = '1px solid #ddd';
    input.style.borderRadius = '20px';
    input.style.fontSize = '14px';
    input.style.outline = 'none';
    
    // Handle input events
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        this.handleUserMessage(input.value.trim());
        input.value = '';
      }
    });
    
    // Create send button
    const sendButton = document.createElement('button');
    sendButton.style.background = '#4361ee';
    sendButton.style.color = 'white';
    sendButton.style.border = 'none';
    sendButton.style.borderRadius = '50%';
    sendButton.style.width = '32px';
    sendButton.style.height = '32px';
    sendButton.style.marginLeft = '8px';
    sendButton.style.cursor = 'pointer';
    sendButton.style.display = 'flex';
    sendButton.style.justifyContent = 'center';
    sendButton.style.alignItems = 'center';
    sendButton.innerHTML = '→';
    
    sendButton.addEventListener('click', () => {
      if (input.value.trim()) {
        this.handleUserMessage(input.value.trim());
        input.value = '';
      }
    });
    
    // Add elements to DOM
    inputContainer.appendChild(input);
    inputContainer.appendChild(sendButton);
    
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(messagesContainer);
    chatContainer.appendChild(inputContainer);
    
    document.body.appendChild(chatContainer);
    
    // Store references
    this.chatInterface = {
      container: chatContainer,
      messagesContainer: messagesContainer,
      input: input
    };
    
    // Add welcome message
    this.addChatMessage('bot', this.shimeji.dialogue.getWelcomeMessage());
  }
  
  /**
   * Toggle chat interface visibility
   */
  toggleChatInterface(show = null) {
    // If chat interface doesn't exist, create it
    if (!this.chatInterface) {
      this.createChatInterface();
    }
    
    // Determine visibility
    if (show === null) {
      show = !this.isVisible;
    }
    
    // Update visibility
    if (show) {
      this.chatInterface.container.style.display = 'block';
      setTimeout(() => {
        this.chatInterface.container.style.transform = 'translateY(0)';
        this.chatInterface.container.style.opacity = '1';
      }, 10);
      this.chatInterface.input.focus();
    } else {
      this.chatInterface.container.style.transform = 'translateY(20px)';
      this.chatInterface.container.style.opacity = '0';
      setTimeout(() => {
        this.chatInterface.container.style.display = 'none';
      }, 300);
    }
    
    this.isVisible = show;
  }
  
  /**
   * Handle user message in chat
   */
  handleUserMessage(message) {
    // Add user message to chat
    this.addChatMessage('user', message);
    
    // Process message with AI agent
    if (this.shimeji.aiAgent) {
      // Get response from AI
      const response = this.shimeji.aiAgent.handleQuestion(message);
      
      // Add bot response to chat
      this.addChatMessage('bot', response.response);
      
      // Show emotion
      if (response.emotion) {
        this.shimeji.stateManager.showEmotion(response.emotion);
      }
    } else {
      // Fallback if AI agent is not available
      const fallbackResponse = "I'm here to help with any questions about the portfolio.";
      this.addChatMessage('bot', fallbackResponse);
    }
  }
  
  /**
   * Add a message to the chat interface
   */
  addChatMessage(sender, message) {
    if (!this.chatInterface) return;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `shimeji-chat-message ${sender}`;
    messageElement.style.marginBottom = '10px';
    messageElement.style.display = 'flex';
    
    // Position based on sender
    if (sender === 'user') {
      messageElement.style.justifyContent = 'flex-end';
    } else {
      messageElement.style.justifyContent = 'flex-start';
    }
    
    // Create message bubble
    const bubble = document.createElement('div');
    bubble.className = 'shimeji-chat-bubble';
    bubble.style.maxWidth = '80%';
    bubble.style.padding = '8px 12px';
    bubble.style.borderRadius = '18px';
    
    // Style based on sender
    if (sender === 'user') {
      bubble.style.backgroundColor = '#4361ee';
      bubble.style.color = 'white';
      bubble.style.borderBottomRightRadius = '4px';
    } else {
      bubble.style.backgroundColor = '#f1f3f5';
      bubble.style.color = '#333';
      bubble.style.borderBottomLeftRadius = '4px';
    }
    
    bubble.textContent = message;
    
    // Add to message element
    messageElement.appendChild(bubble);
    
    // Add to messages container
    this.chatInterface.messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    this.chatInterface.messagesContainer.scrollTop = this.chatInterface.messagesContainer.scrollHeight;
    
    // Store in chat history
    this.chatMessages.push({
      sender,
      message,
      timestamp: Date.now()
    });
  }
  
  /**
   * Open chat with specific question
   */
  promptUserQuestion() {
    this.toggleChatInterface(true);
    
    setTimeout(() => {
      const suggestedQuestions = [
        "Tell me about your projects",
        "What skills do you have?",
        "How can I contact you?",
        "What technologies do you work with?"
      ];
      
      const randomQuestion = suggestedQuestions[Math.floor(Math.random() * suggestedQuestions.length)];
      
      this.addChatMessage('bot', `You can ask me questions like: "${randomQuestion}"`);
    }, 500);
  }
}

export default UIManager; 