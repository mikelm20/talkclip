/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    copyToClipboard: (text: string) => Promise<boolean>;
    closeWindow: () => Promise<void>;
    minimizeWindow: () => Promise<void>;
    onHotkeyActivated: (callback: () => void) => () => void;
  };
}
