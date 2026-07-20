const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  scanDocument: (args) => ipcRenderer.invoke('scan-document', args),
  detectScanners: () => ipcRenderer.invoke('detect-scanners'),
  openFileDialog: (args) => ipcRenderer.invoke('open-file-dialog', args),
});
