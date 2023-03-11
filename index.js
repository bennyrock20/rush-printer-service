const { app, ipcMain, BrowserWindow } = require("electron");


const express = require('express')
const express_app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

const https = require('https');
const fs = require('fs');

const escpos = require("escpos");
escpos.Network = require("escpos-network");

function print(host, port, text){
  const device = new escpos.Network(host, port);
  const options = { encoding: "GB18030" /* default */ };
  const printer = new escpos.Printer(device, options);

  device.open(function () {
    printer
        .text(text)
        .cut()
        .close();
  });
}



/**
 * Electron
 */
function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }

  })


  //load the index.html from a url
  // win.loadURL('https://pos.rushdelivery.app/');
  win.loadFile('index.html');

  // Open the DevTools.
  // win.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow();
});


/**
 * Server
 */

const port = 4101;

const key = fs.readFileSync(__dirname + '/selfsigned.key');
const cert = fs.readFileSync(__dirname + '/selfsigned.crt');
const options = {
  key: key,
  cert: cert
};


const jsonParser = bodyParser.json()
express_app.use(cors())


const server = https.createServer(options, express_app);


express_app.post('/print/', jsonParser, function (req, res) {
  // create user in req.body
  const host = req.body.host;
  const port = req.body.port;
  const text = req.body.text;
  print(host, port, text);
  res.send("ok")
})

express_app.get('/', (req, res) => {
  res.send("ok")
})


server.listen(port)

