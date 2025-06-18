const { app, BrowserWindow, Notification } = require('electron'); // Import Notification
const path = require('path');
const chokidar = require('chokidar');
const fs = require('fs'); // Already imported, but good to note its use for unlink

// Placeholder virus scanning function
function scanFile(filePath) {
  console.log(`Scanning file: ${filePath}`);
  // Simulate scanning time (optional)
  // await new Promise(resolve => setTimeout(resolve, 500));

  const isVirus = Math.random() < 0.1; // 10% chance of being a "virus"
  if (isVirus) {
    // console.log(`!!! VIRUS DETECTED in ${filePath} !!!`); // Logging moved to handler
    return true;
  } else {
    // console.log(`File clean: ${filePath}`); // Logging moved to handler
    return false;
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  const watchedDir = path.join(__dirname, 'watched_folder');

  if (!fs.existsSync(watchedDir)) {
    console.log(`Creating directory: ${watchedDir}`);
    fs.mkdirSync(watchedDir);
  }

  console.log(`Initializing Chokidar to watch: ${watchedDir}`);

  const watcher = chokidar.watch(watchedDir, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
  });

  const handleFileEvent = (filePath, eventType) => {
    console.log(`File ${eventType}: ${filePath}`);
    const isVirus = scanFile(filePath);

    if (isVirus) {
      console.log(`!!! VIRUS DETECTED in ${filePath} !!! Attempting to delete.`);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${filePath}: ${err.message}`);
          // Notify about failure to delete if needed
          if (Notification.isSupported()) {
            new Notification({
              title: "Virus Action Failed!",
              body: `Failed to delete malicious file: ${path.basename(filePath)}. Please check permissions or remove manually.`,
            }).show();
          }
        } else {
          console.log(`Successfully deleted malicious file: ${filePath}`);
          if (Notification.isSupported()) {
            new Notification({
              title: "Virus Detected & Deleted!",
              body: `Malicious file "${path.basename(filePath)}" was found and automatically deleted.`,
            }).show();
          }
        }
      });
    } else {
      console.log(`File clean: ${filePath}`);
      // Optional: Notify that a new/changed file is clean
      /*
      if (Notification.isSupported()) {
        new Notification({
          title: "File Scan Completed",
          body: `File "${path.basename(filePath)}" was scanned and found to be clean.`,
        }).show();
      }
      */
    }
  };

  watcher
    .on('add', filePath => handleFileEvent(filePath, 'added'))
    .on('change', filePath => handleFileEvent(filePath, 'changed'))
    .on('unlink', filePath => console.log(`File removed: ${filePath}`))
    .on('error', error => console.error(`Watcher error: ${error}`))
    .on('ready', () => console.log('Initial scan complete. Ready for changes.'));

  console.log('Chokidar watcher initialized and running in the background.');
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
