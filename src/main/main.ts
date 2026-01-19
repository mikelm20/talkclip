import { app, BrowserWindow, globalShortcut, ipcMain, clipboard, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const windowWidth = 380;
  const windowHeight = 500;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.round((screenWidth - windowWidth) / 2),
    y: Math.round((screenHeight - windowHeight) / 2),
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173/');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('blur', () => {
    // Don't hide on blur - let user control visibility
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function toggleWindow(): void {
  if (!mainWindow) {
    createWindow();
    return;
  }

  if (mainWindow.isVisible()) {
    mainWindow.focus();
    mainWindow.webContents.send('hotkey-activated');
  } else {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('hotkey-activated');
  }
}

function registerGlobalShortcut(): void {
  // Register Ctrl+Shift+V (Cmd+Shift+V on macOS) as the global hotkey
  const shortcut = process.platform === 'darwin' ? 'CommandOrControl+Shift+V' : 'Ctrl+Shift+V';

  const success = globalShortcut.register(shortcut, () => {
    toggleWindow();
  });

  if (!success) {
    console.error('Failed to register global shortcut');
  }
}

app.whenReady().then(() => {
  createWindow();
  registerGlobalShortcut();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('copy-to-clipboard', (_event, text: string) => {
  clipboard.writeText(text);
  return true;
});

ipcMain.handle('close-window', () => {
  mainWindow?.hide();
});

ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize();
});
