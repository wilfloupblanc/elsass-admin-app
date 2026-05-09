const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    getCredentials: () => ipcRenderer.invoke('credentials:get'),
    saveCredentials: (credentials) => ipcRenderer.invoke('credentials:save', credentials),
    clearCredentials: () => ipcRenderer.invoke('credentials:clear'),
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
    installUpdate: () => ipcRenderer.send('install-update'),
})
