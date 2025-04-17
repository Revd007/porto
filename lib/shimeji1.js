/**
 * Shimeji1.js - Legacy Adapter Module
 * 
 * This file serves as a compatibility layer to load the new modular Shimeji implementation
 * while maintaining backward compatibility with code that previously used shimeji1.js
 */

// Import the modular Shimeji implementation
import Shimeji from './shimeji/index.js';

// For backward compatibility, create global instance with the old name
if (typeof window !== 'undefined') {
  window.Shimeji = Shimeji;
  
  // Initialize module when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize if data attribute is present
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

// Legacy compatibility export
export default Shimeji;