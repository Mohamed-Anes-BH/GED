const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { execFile, exec, spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'AgrOdiv GED',
    icon: path.join(__dirname, '../public/images/agrodiv-logo-transparent.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: !isDev
    }
  });

  mainWindow.setMenu(null);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ── IPC: Detect available scanners ──────────────────────────────────────────
ipcMain.handle('detect-scanners', async () => {
  return new Promise((resolve) => {
    // Try SANE (Linux/macOS)
    exec('scanimage -L', { timeout: 8000 }, (error, stdout, stderr) => {
      if (!error && stdout && stdout.trim()) {
        // Parse scanimage -L output
        const lines = stdout.trim().split('\n');
        const scanners = lines
          .filter(line => line.startsWith('device'))
          .map((line, idx) => {
            // e.g. device `imagescan:esci:usb:/dev/bus/usb/...' is a `Epson CX3...`
            const nameMatch = line.match(/is a `([^']+)'/);
            const devMatch = line.match(/`([^']+)'/);
            return {
              id: idx,
              name: nameMatch ? nameMatch[1] : `Scanner ${idx + 1}`,
              device: devMatch ? devMatch[1] : '',
              driver: 'SANE',
              connected: true,
            };
          });
        if (scanners.length > 0) {
          resolve({ success: true, scanners });
          return;
        }
      }

      // Try WIA via powershell (Windows)
      if (process.platform === 'win32') {
        exec(
          'powershell -Command "Get-WmiObject -Class Win32_PnPEntity | Where-Object {$_.Name -match \'Scanner\'} | Select-Object Name | ConvertTo-Json"',
          { timeout: 8000 },
          (err2, stdout2) => {
            if (!err2 && stdout2) {
              try {
                const data = JSON.parse(stdout2);
                const items = Array.isArray(data) ? data : [data];
                const scanners = items
                  .filter(d => d && d.Name)
                  .map((d, idx) => ({
                    id: idx,
                    name: d.Name,
                    device: d.Name,
                    driver: 'WIA',
                    connected: true,
                  }));
                if (scanners.length > 0) {
                  resolve({ success: true, scanners });
                  return;
                }
              } catch (_) {}
            }
            resolve({ success: true, scanners: [] });
          }
        );
        return;
      }

      resolve({ success: true, scanners: [] });
    });
  });
});

// ── IPC: Scan document ───────────────────────────────────────────────────────
ipcMain.handle('scan-document', async (event, args) => {
  const { resolution = '300', colorMode = 'Color', format = 'pdf', device } = args || {};

  // Map frontend color to scanimage mode
  const modeMap = { 'Couleur': 'Color', 'N&B': 'Black', 'Niveaux de gris': 'Gray' };
  const scanMode = modeMap[colorMode] || colorMode || 'Color';
  const dpi = resolution.replace(' dpi', '');

  const tmpDir = os.tmpdir();
  const outputBase = path.join(tmpDir, `agrodiv-scan-${Date.now()}`);
  const outputPath = format.toLowerCase() === 'pdf'
    ? `${outputBase}.pdf`
    : `${outputBase}.png`;

  return new Promise((resolve) => {
    const scanArgs = [
      '--format', format.toLowerCase() === 'pdf' ? 'pdf' : 'png',
      `--resolution=${dpi}`,
      `--mode=${scanMode}`,
      `--output-file=${outputPath}`,
    ];
    if (device) scanArgs.unshift(`--device=${device}`);

    execFile('scanimage', scanArgs, { timeout: 60000 }, (error) => {
      if (error) {
        resolve({
          success: false,
          error: 'Scanner indisponible. Utilisez le bouton "Importer" pour sélectionner un fichier.',
        });
        return;
      }

      try {
        const fileBuffer = fs.readFileSync(outputPath);
        const base64 = fileBuffer.toString('base64');
        const mimeType = format.toLowerCase() === 'pdf' ? 'application/pdf' : 'image/png';
        resolve({
          success: true,
          file: outputPath,
          base64: `data:${mimeType};base64,${base64}`,
          mimeType,
          filename: path.basename(outputPath),
        });
      } catch (e) {
        resolve({ success: false, error: 'Impossible de lire le fichier scanné.' });
      }
    });
  });
});

// ── IPC: Open native file picker ─────────────────────────────────────────────
ipcMain.handle('open-file-dialog', async (event, args) => {
  const { multiple = true } = args || {};
  const result = await dialog.showOpenDialog({
    title: 'Importer des documents',
    filters: [
      { name: 'Documents', extensions: ['pdf', 'png', 'jpg', 'jpeg'] },
      { name: 'PDF', extensions: ['pdf'] },
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] },
    ],
    properties: multiple ? ['openFile', 'multiSelections'] : ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true, files: [] };
  }

  const files = result.filePaths.map(filePath => {
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    const mimeMap = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };
    const mimeType = mimeMap[ext] || 'application/octet-stream';
    try {
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      return {
        path: filePath,
        filename: path.basename(filePath),
        mimeType,
        size: buffer.length,
        base64: `data:${mimeType};base64,${base64}`,
      };
    } catch (e) {
      return { path: filePath, filename: path.basename(filePath), mimeType, size: 0, base64: null };
    }
  });

  return { canceled: false, files };
});
