// main.js

// electron 模块可以用来控制应用的生命周期和创建原生浏览窗口
const { app, BrowserWindow , globalShortcut , clipboard , ipcMain , screen  } = require("electron")
const path = require("path")
const robot = require("robotjs");
const fs = require("fs");
const default_config = require("./default_config.json");
const { exec } = require("child_process")

function createWindow(){
	// 创建浏览窗口
	const mainWindow = new BrowserWindow({
		width: 600,
		height: 400,
        transparent: true,
        frame: false,
        resizable: false,
        maximizable: false,
		webPreferences: {
			nodeIntegration: true , 
            preload: path.join(__dirname, "main_preload.js") , 
		}
	})

	mainWindow.loadFile('./dist/index.html')
	// mainWindow.loadURL('http://127.0.0.1:5173/')
    // mainWindow.webContents.openDevTools()

    return mainWindow
}

function get_config(){

    let tar_path = `${app.getPath("userData")}/config.json`
    let data = fs.readFileSync(tar_path, {encoding: "utf8", flag: "a+"})
    if(data == ""){ // 文件不存在
        fs.writeFileSync(tar_path, JSON.stringify(default_config), {encoding: "utf8"})
        return JSON.stringify(default_config)
    }
    return data
}

app.whenReady().then(() => {
    // 创建窗口
	var win = createWindow()
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0){
			win = createWindow()
        }
	})
    win.hide()
    // win.setAlwaysOnTop(true)

    // 获得config
    ipcMain.handle("window-ready", ()=>{
        let config = get_config()
        win.webContents.send("loadconfig", config)
    })

    // 关闭窗口
    ipcMain.handle("window-should-close", ()=>{
        win.hide()
    })

    // 打开配置文件
    ipcMain.handle("window-open-config", ()=>{
        exec(`${app.getPath("userData")}/config.json`)
    })

    // TODO 不确定要不要搞动态可点击
    // 鼠标进入
    ipcMain.handle("window-mouse-enter", ()=>{
        // win.setIgnoreMouseEvents(false)
        // console.log("enter")
    })

    // 鼠标离开
    ipcMain.handle("window-mouse-leave", ()=>{
        // win.setIgnoreMouseEvents(true)
        // console.log("out")
    })

    // 防止失去焦点后无法获得鼠标进入消息
    win.on("focus", ()=>{
        // win.setIgnoreMouseEvents(false)
    })


    // 设置快捷键
    if(!globalShortcut.register("Ctrl+Alt+C", () => {
        let {x,y} = screen.getCursorScreenPoint()
        win.setPosition(x,y, true)

        if(win.isVisible()){
            win.hide()
        }
        else{
            let copied = clipboard.readText()
            win.show()
            win.focus()
            win.webContents.send("update", copied)
        }

    })){
        console.log("registration failed")
    }
})

app.on("window-all-closed", () => {
    
    globalShortcut.unregisterAll()
    app.quit()
})


