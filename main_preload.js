const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
    onUpdateCounter: (callback) => {
        ipcRenderer.on("update", callback)
    } , 
    onLoadedConfig: (callback) => {
        ipcRenderer.on("loadconfig", callback)
    } , 
    ImOpen: () => ipcRenderer.invoke("window-ready") , 
    IWantToClose: () => ipcRenderer.invoke("window-should-close") , 
    MouseEnter: () => ipcRenderer.invoke("window-mouse-enter") , 
    MouseLeave: () => ipcRenderer.invoke("window-mouse-leave") , 
    OpenConfig: () => ipcRenderer.invoke("window-open-config") , 
})

