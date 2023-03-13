// main.js

// electron 模块可以用来控制应用的生命周期和创建原生浏览窗口
const { app, BrowserWindow , globalShortcut , clipboard , ipcMain } = require('electron')
const path = require('path')
const robot = require("robotjs");

function createWindow(){
	// 创建浏览窗口
	const mainWindow = new BrowserWindow({
		width: 600,
		height: 600,
        // transparent: true,
        // frame: false,
        // resizable: false,
        // maximizable: false,
		webPreferences: {
			nodeIntegration: true , 
            preload: path.join(__dirname, 'main_preload.js') , 
		}
	})

	// mainWindow.loadFile('./dist/index.html')
	mainWindow.loadURL('http://127.0.0.1:5174/')
    mainWindow.webContents.openDevTools()


    return mainWindow
}

app.whenReady().then(() => {
	var win = createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0){
			win = createWindow()
        }
	})

    // win.setIgnoreMouseEvents(true)
    // win.hide() 
    const ret = globalShortcut.register('CommandOrControl+X', () => {
        let copied = clipboard.readText()
        win.show()
        win.webContents.send('update', copied)

    })
    if (!ret) {
        console.log('registration failed')
    }
    console.log(globalShortcut.isRegistered('CommandOrControl+X'))

})

app.on('window-all-closed', () => {
    
    // Unregister all shortcuts.
    globalShortcut.unregisterAll()

	if (process.platform !== 'darwin'){
        app.quit()
    }
})


