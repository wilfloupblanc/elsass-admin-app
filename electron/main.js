const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Store = require('electron-store')
const store = new Store()
const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        show: false,
        icon: path.join(__dirname, '../public/iconSite.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        title: 'Elsass SimRacing - Admin'
    })

    win.once('ready-to-show', () => {
        win.maximize()
        setTimeout(() => win.show(), 50)
    })

    if (isDev) {
        win.loadURL('http://localhost:5173')
        win.webContents.openDevTools()
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'))
    }
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('credentials:get', () => {
    return store.get('savedCredentials') ?? null
})

ipcMain.handle('credentials:save', (event, credentials) => {
    store.set('savedCredentials', credentials)
})

ipcMain.handle('credentials:clear', () => {
    store.delete('savedCredentials')
})