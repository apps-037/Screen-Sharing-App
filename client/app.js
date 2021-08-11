
const { app, BrowserWindow, ipcMain } = require('electron')
const{v4: uuidv4 }= require('uuid');
const screenshot = require('screenshot-desktop');
const path = require('path')


var socket = require('socket.io-client')('http://127.0.0.1:5000');
var interval;

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 500,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })
 // mainWindow.removeMenu();
  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


ipcMain.on("start-share", function(event, arg){
    
     var uuid = uuidv4();
     socket.emit("join-message", uuid);
     event.reply("uuid", uuid);
    //take continuous ss

    interval = setInterval(function() {
        screenshot().then((img) => {
            var imgStr = new Buffer(img).toString('base64');
            //console.log(imgStr);

            var obj ={};
            obj.room = uuid;
            obj.image = imgStr;

            socket.emit("screen-data", JSON.stringify(obj));



        })
    }, 100)

    //broadcast it to other users

})

ipcMain.on("stop-share", function(event, arg){
  
    clearInterval(interval);
    
})
