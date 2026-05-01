/**
 * useFocusTrap Hook
 *
 * Houdt focus binnen een modal/container voor keyboard toegankelijkheid.
 * Tab/Shift+Tab circuleert binnen de focusable elements.
 * Escape roept onClose aan.
 *
 * @module hooks/useFocusTrap
 */

import { useEffect, useRef } from 'react';

/**
 * Vind alle focusable elementen binnen een container
 * @param {HTMLElement} container
 * @returns {HTMLElement[]}
 */
function getFocusableElements(container) {
  if (!container) return [];
  
  const selector = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');
  
  return Array.from(container.querySelectorAll(selector)).filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
  );
}

/**
 * Hook voor focus trap binnen een modal
 * @param {Object} options
 * @param {boolean} options.isActive - Of de focus trap actief is
 * @param {Function} [options.onClose] - Callback wanneer Escape wordt gedrukt
 */
export function useFocusTrap({ isActive, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Sla originele focus op
    const previousFocus = document.activeElement;

    // Focus op eerste focusable element
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const elements = getFocusableElements(container);
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Herstel originele focus
      if (previousFocus && previousFocus.focus) {
        previousFocus.focus();
      }
    };
  }, [isActive, onClose]);

  return containerRef;
}

export default useFocusTrap;
