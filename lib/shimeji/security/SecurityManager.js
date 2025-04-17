/**
 * SecurityManager - Handles security features for Shimeji
 */

class SecurityManager {
  constructor(shimeji) {
    this.shimeji = shimeji;
    
    // Configuration
    this.securityEnabled = true;
    this.debugMode = false;
    this.detectedDevTools = false;
    this.warningCount = 0;
    this.consoleSpamInterval = null;
    
    // Setup security protection
    if (this.securityEnabled) {
      this.setupSecurityProtection();
    }
  }
  
  /**
   * Setup security protection measures
   */
  setupSecurityProtection() {
    if (!this.securityEnabled) return;
    
    // Add event listeners for security
    this.addEventListenersSecurity();
    
    // Detect if DevTools is already open
    this.detectDevTools();
  }
  
  /**
   * Add event listeners for security features
   */
  addEventListenersSecurity() {
    // Check when window is resized (might indicate DevTools opening)
    window.addEventListener('resize', () => {
      this.detectDevTools();
    });
    
    // Monitor console events
    this.overrideConsoleMethods();
    
    // Block context menu (right click)
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      return false;
    }, true);
    
    // Block keyboard shortcuts for DevTools
    document.addEventListener('keydown', (event) => {
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, F12
      if (
        (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'i' || event.key === 'J' || event.key === 'j' || event.key === 'C' || event.key === 'c')) ||
        (event.key === 'F12')
      ) {
        event.preventDefault();
        this.handleDevToolsOpened('keyboard shortcut');
        return false;
      }
    }, true);
  }
  
  /**
   * Detect if DevTools is open
   */
  detectDevTools() {
    if (this.detectedDevTools) return;
    
    const detectionMethods = [
      this.checkSizeDevTools.bind(this),
      this.checkDebuggerDevTools.bind(this),
      this.checkDevToolsFeatures.bind(this)
    ];
    
    // Run all detection methods
    for (const method of detectionMethods) {
      if (method()) {
        this.handleDevToolsOpened(method.name);
        break;
      }
    }
  }
  
  /**
   * Check DevTools by window size difference
   */
  checkSizeDevTools() {
    const heightThreshold = 100;
    const widthThreshold = 100;
    
    if ((window.outerHeight - window.innerHeight > heightThreshold) ||
        (window.outerWidth - window.innerWidth > widthThreshold)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Check DevTools by debugger functions
   */
  checkDebuggerDevTools() {
    const debuggerKeys = ['__REACT_DEVTOOLS_GLOBAL_HOOK__', '__REDUX_DEVTOOLS_EXTENSION__', 'Firebug', '__REACT_DEVTOOLS_COMPONENT_FILTERS__'];
    
    for (const key of debuggerKeys) {
      if (window[key]) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check DevTools by specific features
   */
  checkDevToolsFeatures() {
    // Check for Firefox/Safari dev tools by analyzing error stack
    let isDevToolsOpen = false;
    
    try {
      // Create a special error and check its stack
      const err = new Error();
      if (err.stack.indexOf('getScriptNameOrSourceURL') !== -1) {
        isDevToolsOpen = true;
      }
      
      // Check for Chrome dev tools using timing attack
      const start = performance.now();
      
      // This operation is much slower with DevTools open
      for (let i = 0; i < 1000; i++) {
        console.debug();
      }
      
      const end = performance.now();
      
      // Check elapsed time (Chrome DevTools typically slows this down significantly)
      if (end - start > 100) {
        isDevToolsOpen = true;
      }
    } catch (e) {
      // Error during check, ignore
    }
    
    return isDevToolsOpen;
  }
  
  /**
   * Handle when DevTools is opened
   */
  handleDevToolsOpened(reason) {
    if (this.detectedDevTools) return;
    
    this.detectedDevTools = true;
    this.warningCount++;
    
    console.warn('DevTools detected via:', reason);
    
    // Show warning with Shimeji
    if (this.shimeji.stateManager) {
      this.shimeji.stateManager.showEmotion('surprised');
    }
    
    if (this.shimeji.dialogue) {
      this.shimeji.dialogue.showDialogue('surprised', "DevTools detected! Please respect this work.");
    }
    
    // Take actions based on warning count
    if (this.warningCount >= 3) {
      this.activateAntiInspectionMeasures();
    } else {
      // Reset detection after a delay
      setTimeout(() => {
        this.detectedDevTools = false;
      }, 3000);
    }
  }
  
  /**
   * Override console methods to detect usage
   */
  overrideConsoleMethods() {
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };
    
    // Override console methods
    for (const [method, originalFunction] of Object.entries(originalConsole)) {
      console[method] = (...args) => {
        // Call original function
        originalFunction.apply(console, args);
        
        // Check if this is coming from DevTools
        const stack = new Error().stack || '';
        if (stack.includes('devtools') || stack.includes('debugger')) {
          this.handleDevToolsOpened(`console.${method}`);
        }
      };
    }
    
    // Override console.clear to prevent clearing
    const originalClear = console.clear;
    console.clear = () => {
      originalClear.call(console);
      
      // Show message after clear
      console.warn('Console was cleared, but security monitoring continues.');
      
      // Check if from DevTools
      const stack = new Error().stack || '';
      if (stack.includes('devtools') || stack.includes('debugger')) {
        this.handleDevToolsOpened('console.clear');
      }
    };
  }
  
  /**
   * Activate anti-inspection measures
   */
  activateAntiInspectionMeasures() {
    // Don't run if in debug mode
    if (this.debugMode) return;
    
    console.warn('Activating anti-inspection measures.');
    
    // Spam console warnings
    this.spamConsoleWarnings();
    
    // Have character follow cursor
    if (this.shimeji) {
      this.startFollowingCursor();
    }
    
    // Add CSS protection
    this.addCSSProtection();
    
    // Intercept network requests
    this.interceptNetworkRequests();
    
    // Block asset inspection
    this.blockAssetInspection();
  }
  
  /**
   * Start following cursor with Shimeji
   */
  startFollowingCursor() {
    const followMouseHandler = (e) => {
      if (this.shimeji.behaviorManager) {
        this.shimeji.behaviorManager.moveTo(e.clientX, e.clientY, 'running');
      }
    };
    
    document.addEventListener('mousemove', followMouseHandler);
    
    // Store handler for later removal
    this._followMouseHandler = followMouseHandler;
    
    // Stop following after a while
    setTimeout(() => {
      this.stopFollowingCursor();
    }, 10000);
  }
  
  /**
   * Stop following cursor
   */
  stopFollowingCursor() {
    if (this._followMouseHandler) {
      document.removeEventListener('mousemove', this._followMouseHandler);
      this._followMouseHandler = null;
    }
  }
  
  /**
   * Spam console with warnings
   */
  spamConsoleWarnings() {
    if (this.consoleSpamInterval) {
      clearInterval(this.consoleSpamInterval);
    }
    
    const messages = [
      'Please close DevTools.',
      'This site is protected against inspection.',
      'Unauthorized access detected.',
      'DevTools usage is being monitored.'
    ];
    
    let count = 0;
    this.consoleSpamInterval = setInterval(() => {
      console.warn(messages[count % messages.length]);
      count++;
      
      // Stop after 50 messages
      if (count >= 50) {
        this.stopConsoleSpam();
      }
    }, 100);
  }
  
  /**
   * Stop console spam
   */
  stopConsoleSpam() {
    if (this.consoleSpamInterval) {
      clearInterval(this.consoleSpamInterval);
      this.consoleSpamInterval = null;
    }
  }
  
  /**
   * Add CSS protection
   */
  addCSSProtection() {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide DevTools-related elements */
      .__devtools__, .__debug__, .drawer-contents, 
      .console-view, .panel, .elements-tree {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        width: 0 !important;
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        pointer-events: none !important;
      }
      
      /* Prevent selection of images */
      img {
        -webkit-user-drag: none;
        -webkit-touch-callout: none;
        user-select: none;
        pointer-events: none;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Intercept network requests
   */
  interceptNetworkRequests() {
    // Store original fetch
    const originalFetch = window.fetch;
    
    // Override fetch
    window.fetch = function(url, options) {
      // Check if this is a DevTools-related request
      if (typeof url === 'string' && 
          (url.includes('devtools') || url.includes('debugger') || url.includes('inspector'))) {
        console.warn('Suspicious request blocked:', url);
        return Promise.reject(new Error('Request blocked'));
      }
      
      return originalFetch.apply(this, arguments);
    };
    
    // Store original XHR open
    const originalXHROpen = XMLHttpRequest.prototype.open;
    
    // Override XHR open
    XMLHttpRequest.prototype.open = function(method, url) {
      if (typeof url === 'string' && 
          (url.includes('.js') || url.includes('.png') || url.includes('assets'))) {
        const stack = new Error().stack || '';
        if (stack.includes('devtools') || stack.includes('debugger')) {
          console.warn('Asset inspection blocked:', url);
          throw new Error('Access denied');
        }
      }
      
      return originalXHROpen.apply(this, arguments);
    };
  }
  
  /**
   * Block asset inspection
   */
  blockAssetInspection() {
    // Store original createElement
    const originalCreateElement = document.createElement;
    
    // Override createElement
    document.createElement = function(tagName) {
      const element = originalCreateElement.call(document, tagName);
      
      if (tagName.toLowerCase() === 'script') {
        const stack = new Error().stack || '';
        if (stack.includes('devtools') || stack.includes('debugger')) {
          // Block script creation from DevTools
          return originalCreateElement.call(document, 'span');
        }
      }
      
      return element;
    };
  }
  
  /**
   * Toggle debug mode
   */
  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    console.info(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
    
    // Reset security measures
    if (this.debugMode) {
      this.detectedDevTools = false;
      this.warningCount = 0;
      this.stopConsoleSpam();
      this.stopFollowingCursor();
    }
    
    return this.debugMode;
  }
}

export default SecurityManager; 