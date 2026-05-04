const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    getCredentials: () => ipcRenderer.invoke('credentials:get'),
    saveCredentials: (credentials) => ipcRenderer.invoke('credentials:save', credentials),
    clearCredentials: () => ipcRenderer.invoke('credentials:clear'),
})
