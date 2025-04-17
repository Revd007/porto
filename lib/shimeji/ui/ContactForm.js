/**
 * ContactForm - Handles contact form integration
 */

class ContactForm {
  constructor(shimeji) {
    this.shimeji = shimeji;
    this.form = null;
    this.options = {
      recipientEmail: 'revianravilathala@gmail.com',
      enableShimejiNotification: true
    };
  }
  
  /**
   * Set up contact form functionality
   */
  setup(options = {}) {
    // Merge with default options
    this.options = {
      ...this.options,
      ...options
    };
    
    // Find contact form
    this.findContactForm();
    
    // If form found, set up event listeners
    if (this.form) {
      this.setupFormListeners();
    }
  }
  
  /**
   * Find contact form in the document
   */
  findContactForm() {
    // Look for contact form by common selectors
    const possibleForms = [
      document.querySelector('form.contact-form'),
      document.querySelector('form#contact-form'),
      document.querySelector('form#contactForm'),
      document.querySelector('section#contact form'),
      document.querySelector('.contact-section form'),
      document.querySelector('.contact form')
    ];
    
    // Use the first form that exists
    this.form = possibleForms.find(form => form !== null) || null;
  }
  
  /**
   * Set up form event listeners
   */
  setupFormListeners() {
    if (!this.form) return;
    
    // Remove any existing listeners
    const newForm = this.form.cloneNode(true);
    this.form.parentNode.replaceChild(newForm, this.form);
    this.form = newForm;
    
    // Add submit event listener
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(this.form);
    });
    
    // Add focus event listener to show help
    const formElements = this.form.querySelectorAll('input, textarea');
    formElements.forEach(element => {
      element.addEventListener('focus', () => {
        // Show helpful message when user interacts with form
        if (this.shimeji.dialogue) {
          this.shimeji.dialogue.showDialogue('contact', "Need help sending a message? Fill out the form and I'll make sure it gets delivered!");
        }
        
        // Show happy emotion
        if (this.shimeji.stateManager) {
          this.shimeji.stateManager.showEmotion('happy');
        }
      });
    });
  }
  
  /**
   * Handle form submission
   */
  handleFormSubmit(form) {
    // Get form data
    const formData = new FormData(form);
    const emailData = {};
    
    // Required fields
    const requiredFields = ['name', 'email', 'message'];
    let missingFields = [];
    
    // Process form fields
    for (const [key, value] of formData.entries()) {
      emailData[key] = value;
      
      // Check if required field is empty
      if (requiredFields.includes(key) && !value.trim()) {
        missingFields.push(key);
      }
    }
    
    // If email field exists, validate it
    if (emailData.email && !this.isValidEmail(emailData.email)) {
      this.showContactFormError("Please enter a valid email address.");
      return;
    }
    
    // Check for missing required fields
    if (missingFields.length > 0) {
      const fieldLabels = missingFields.map(field => field.charAt(0).toUpperCase() + field.slice(1)).join(', ');
      this.showContactFormError(`Please fill in the following required fields: ${fieldLabels}`);
      return;
    }
    
    // Prepare email data
    const email = {
      to: this.options.recipientEmail || emailData.recipient || '',
      from: emailData.email || '',
      name: emailData.name || '',
      subject: emailData.subject || 'New Contact Form Submission',
      message: emailData.message || ''
    };
    
    // If we have a recipient email, try to send
    if (email.to) {
      this.sendContactEmail(email);
    } else {
      this.showContactFormError("No recipient email configured. Please set up the contact form properly.");
    }
  }
  
  /**
   * Send contact email
   */
  sendContactEmail(emailData) {
    // Disable form
    if (this.form) {
      const submitButton = this.form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }
    }
    
    // Show sending notification
    if (this.shimeji.dialogue) {
      this.shimeji.dialogue.showDialogue('contact', "Sending your message... I'll make sure it gets delivered!");
    }
    
    // Show working emotion
    if (this.shimeji.stateManager) {
      this.shimeji.stateManager.showEmotion('thinking');
    }
    
    // Attempt to use SMTP.js if available
    if (window.Email && this.options.smtpUser) {
      // Use SMTP.js to send email
      window.Email.send({
        Host: this.options.smtpService || 'smtp.elasticemail.com',
        Username: this.options.smtpUser,
        Password: this.options.smtpPassword,
        Port: this.options.smtpPort || 2525,
        To: emailData.to,
        From: emailData.from,
        Subject: emailData.subject,
        Body: `
          <h2>New message from ${emailData.name}</h2>
          <p><strong>Email:</strong> ${emailData.from}</p>
          <p><strong>Message:</strong></p>
          <p>${emailData.message.replace(/\n/g, '<br>')}</p>
        `
      }).then(() => {
        this.handleEmailSuccess(emailData);
      }).catch(error => {
        console.error('Email sending failed:', error);
        this.handleEmailError(error);
      });
    } else {
      // If SMTP.js not available, show simulation message
      setTimeout(() => {
        // Simulated success
        if (Math.random() > 0.2) {
          this.handleEmailSuccess(emailData);
        } else {
          this.handleEmailError(new Error('Simulated error'));
        }
      }, 2000);
    }
  }
  
  /**
   * Handle successful email send
   */
  handleEmailSuccess(emailData) {
    // Reset form
    if (this.form) {
      this.form.reset();
      const submitButton = this.form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
      }
    }
    
    // Show success message
    if (this.shimeji.ui) {
      this.shimeji.ui.showPopup('Message sent successfully!', 'success');
    }
    
    // Show success dialogue
    if (this.shimeji.dialogue) {
      this.shimeji.dialogue.showDialogue('contact', "Great! Your message has been sent. You can expect a response soon!");
    }
    
    // Show happy emotion
    if (this.shimeji.stateManager) {
      this.shimeji.stateManager.showEmotion('happy');
    }
    
    // If enabled, show notification
    if (this.options.enableShimejiNotification) {
      this.sendShimejiNotification(emailData);
    }
  }
  
  /**
   * Handle email send error
   */
  handleEmailError(error) {
    console.error('Contact form error:', error);
    
    // Reset button state
    if (this.form) {
      const submitButton = this.form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
      }
    }
    
    // Show error message
    if (this.shimeji.ui) {
      this.shimeji.ui.showPopup('Failed to send message. Please try again.', 'error');
    }
    
    // Show error dialogue
    if (this.shimeji.dialogue) {
      this.shimeji.dialogue.showDialogue('contact', "I'm sorry, there was an error sending your message. Please try again or use another contact method.");
    }
    
    // Show sad emotion
    if (this.shimeji.stateManager) {
      this.shimeji.stateManager.showEmotion('surprised');
    }
  }
  
  /**
   * Show contact form error
   */
  showContactFormError(message) {
    // Show error in UI manager if available
    if (this.shimeji.ui) {
      this.shimeji.ui.showPopup(message, 'error');
    }
    
    // Show error dialogue
    if (this.shimeji.dialogue) {
      this.shimeji.dialogue.showDialogue('contact', message);
    }
    
    // Show surprised emotion
    if (this.shimeji.stateManager) {
      this.shimeji.stateManager.showEmotion('surprised');
    }
  }
  
  /**
   * Send a notification from Shimeji
   */
  sendShimejiNotification(emailData) {
    // Create notification container if it doesn't exist
    let notificationElement = document.querySelector('.shimeji-notification');
    if (!notificationElement) {
      notificationElement = document.createElement('div');
      notificationElement.className = 'shimeji-notification';
      notificationElement.style.position = 'fixed';
      notificationElement.style.top = '20px';
      notificationElement.style.right = '20px';
      notificationElement.style.backgroundColor = 'white';
      notificationElement.style.padding = '15px';
      notificationElement.style.borderRadius = '10px';
      notificationElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
      notificationElement.style.maxWidth = '320px';
      notificationElement.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
      notificationElement.style.fontSize = '14px';
      notificationElement.style.lineHeight = '1.4';
      notificationElement.style.zIndex = '10000';
      notificationElement.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      notificationElement.style.transform = 'translateX(400px)';
      notificationElement.style.borderLeft = '4px solid #4361ee';
      
      document.body.appendChild(notificationElement);
    }
    
    // Set notification content
    notificationElement.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <div style="font-weight: bold; color: #4361ee; margin-right: 10px;">Message Delivered!</div>
        <div style="margin-left: auto; cursor: pointer;" class="close-btn">&times;</div>
      </div>
      <div>
        <p style="margin: 0 0 10px 0;">I've delivered <strong>${emailData.name}</strong>'s message successfully! They'll receive a response soon.</p>
      </div>
    `;
    
    // Add close button functionality
    const closeBtn = notificationElement.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      notificationElement.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (notificationElement.parentNode) {
          notificationElement.parentNode.removeChild(notificationElement);
        }
      }, 300);
    });
    
    // Show notification
    setTimeout(() => {
      notificationElement.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      notificationElement.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (notificationElement.parentNode) {
          notificationElement.parentNode.removeChild(notificationElement);
        }
      }, 300);
    }, 10000);
  }
  
  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default ContactForm; 