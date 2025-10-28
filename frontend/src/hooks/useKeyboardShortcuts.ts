import { useEffect, useCallback } from 'react';

type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  handler: () => void;
  description?: string;
};

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(
        (shortcut) =>
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          // Prevent triggering when user is typing in an input
          !['input', 'textarea'].includes(
            (event.target as HTMLElement)?.tagName?.toLowerCase() || ''
          )
      );

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.handler();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Return list of shortcuts for documentation
  const getShortcutsList = () =>
    shortcuts.map((shortcut) => ({
      key: [
        shortcut.ctrlKey && 'Ctrl',
        shortcut.altKey && 'Alt',
        shortcut.shiftKey && 'Shift',
        shortcut.key.toUpperCase(),
      ]
        .filter(Boolean)
        .join(' + '),
      description: shortcut.description,
    }));

  return { getShortcutsList };
};