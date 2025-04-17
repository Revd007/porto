/**
 * Shimeji - Interactive character for web pages
 * Main Entry Point
 */

import Shimeji from './core/Shimeji.js';

// Export the main Shimeji class
export default Shimeji;

// Create and export a global instance for direct use in scripts
if (typeof window !== 'undefined') {
  window.Shimeji = Shimeji;
  
  // Auto initialize when the DOM is ready if data-auto-init attribute exists
  document.addEventListener('DOMContentLoaded', () => {
    const autoInitElements = document.querySelectorAll('[data-shimeji-auto-init]');
    if (autoInitElements.length > 0) {
      const options = {};
      const element = autoInitElements[0];
      
      // Parse data attributes as options
      Array.from(element.attributes)
        .filter(attr => attr.name.startsWith('data-shimeji-'))
        .forEach(attr => {
          const optionName = attr.name
            .replace('data-shimeji-', '')
            .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          
          options[optionName] = attr.value;
        });
      
      // Initialize Shimeji with the options
      window.hutaoInstance = new Shimeji(options);
    }
  });
} 