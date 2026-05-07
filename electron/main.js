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
        icon: path.join(__dirname, '../public/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            partition: 'persist:main'
        },
        title: 'Elsass SimRacing - Admin'
    })

    win.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
        callback({ requestHeaders: { ...details.requestHeaders } })
    })

    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        const headers = { ...details.responseHeaders }
        if (headers['set-cookie']) {
            headers['set-cookie'] = headers['set-cookie'].map(cookie =>
                cookie.replace(/SameSite=None/gi, 'SameSite=Lax')
                    .replace(/; Secure/gi, '')
            )
        }
        callback({ responseHeaders: headers })
    })


    win.once('ready-to-show', () => {
        win.maximize()
        setTimeout(() => win.show(), 50)
    })

    if (isDev) {
        win.loadURL('http://localhost:5174')
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