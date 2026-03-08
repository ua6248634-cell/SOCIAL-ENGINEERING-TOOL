const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize:    () => ipcRenderer.send('window-minimize'),
  maximize:    () => ipcRenderer.send('window-maximize'),
  close:       () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-max'),

  // Clipboard
  writeClipboard: (text) => ipcRenderer.invoke('clipboard-write', text),
  readClipboard:  ()     => ipcRenderer.invoke('clipboard-read'),

  // Shell & notifications
  openURL:          (url)       => ipcRenderer.invoke('open-url', url),
  showNotification: (opts)      => ipcRenderer.invoke('show-notification', opts),
  saveFile:         (opts)      => ipcRenderer.invoke('save-file', opts),

  // System info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getLocalIP:    () => ipcRenderer.invoke('get-local-ip'),

  // Network tools
  dnsLookup:  (opts) => ipcRenderer.invoke('dns-lookup', opts),
  tcpCheck:   (opts) => ipcRenderer.invoke('tcp-check', opts),
  scanPorts:  (opts) => ipcRenderer.invoke('scan-ports', opts),
  execCommand:(cmd)  => ipcRenderer.invoke('exec-command', cmd),
});
