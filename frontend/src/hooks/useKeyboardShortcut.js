import { useEffect } from "react";

/**
 * Custom hook for keyboard shortcuts
 * @param {string} key - The key to listen for (e.g., 'n', 'k')
 * @param {Function} callback - Function to call when shortcut is triggered
 * @param {Object} options - Options for the shortcut
 * @param {boolean} options.ctrl - Require Ctrl key (default: false)
 * @param {boolean} options.shift - Require Shift key (default: false)
 * @param {boolean} options.alt - Require Alt key (default: false)
 * @param {boolean} options.enabled - Whether the shortcut is enabled (default: true)
 */
export const useKeyboardShortcut = (key, callback, options = {}) => {
  const { ctrl = false, shift = false, alt = false, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Ignore if user is typing in an input/textarea
      const target = event.target;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Check if the key matches
      const keyMatch = event.key.toLowerCase() === key.toLowerCase();

      // Check if modifiers match
      const ctrlMatch = ctrl
        ? event.ctrlKey || event.metaKey
        : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
      const altMatch = alt ? event.altKey : !event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, callback, ctrl, shift, alt, enabled]);
};

/**
 * Hook for multiple keyboard shortcuts
 * @param {Array} shortcuts - Array of shortcut configs
 * Example: [
 *   { key: 'n', ctrl: true, callback: handleCreate },
 *   { key: 'k', ctrl: true, callback: handleSearch }
 * ]
 */
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore if user is typing in an input/textarea
      const target = event.target;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      shortcuts.forEach(
        ({
          key,
          callback,
          ctrl = false,
          shift = false,
          alt = false,
          enabled = true,
        }) => {
          if (!enabled) return;

          const keyMatch = event.key.toLowerCase() === key.toLowerCase();
          const ctrlMatch = ctrl
            ? event.ctrlKey || event.metaKey
            : !event.ctrlKey && !event.metaKey;
          const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
          const altMatch = alt ? event.altKey : !event.altKey;

          if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
            event.preventDefault();
            callback(event);
          }
        }
      );
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts]);
};
