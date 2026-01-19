import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  onHotkeyActivated: (callback: () => void) => {
    ipcRenderer.on('hotkey-activated', callback);
    return () => ipcRenderer.removeListener('hotkey-activated', callback);
  }
});

declare global {
  interface Window {
    electronAPI: {
      copyToClipboard: (text: string) => Promise<boolean>;
      closeWindow: () => Promise<void>;
      minimizeWindow: () => Promise<void>;
      onHotkeyActivated: (callback: () => void) => () => void;
    };
  }
}
