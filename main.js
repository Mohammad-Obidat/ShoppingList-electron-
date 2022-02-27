const path = require('path');
const url = require('url');

const { app, BrowserWindow, Menu, ipcMain } = require('electron');

//set ENV
process.env.Node_ENV = 'production';

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready', () => {
  //creat a new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // Load html into window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'mainWindow.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  //Quit app when closed
  mainWindow.on('closed', () => {
    app.quit();
  });

  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow() {
  //creat a new window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Item',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // Load html into window
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'addWindow.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  //Garbage collection handle
  addWindow.on('close', () => {
    addWindow = null;
  });
}

// Catch item:add
ipcMain.on('item:add', function (e, item) {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

//creat menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        click() {
          createAddWindow();
        },
      },
      {
        label: 'Clear Items',
        click() {
          mainWindow.webContents.send('item:clear');
        },
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        },
      },
    ],
  },
];

// If mac, add empty object to menu
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
}

//Add developer tools item if not in production
if (process.env.Node_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        role: 'reload',
      },
    ],
  });
}
