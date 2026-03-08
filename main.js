const { app, BrowserWindow, ipcMain, shell, clipboard, dialog, Notification, Menu, Tray } = require('electron');
const path = require('path');
const os = require('os');
const dns = require('dns');
const net = require('net');
const { exec } = require('child_process');

let mainWindow;
let tray;
const APP_VERSION = '5.0.0';

// ── Splash window ───────────────────────────────────────────────
function createSplash() {
  const splash = new BrowserWindow({
    width: 520, height: 320,
    frame: false, transparent: true,
    alwaysOnTop: true, resizable: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  splash.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
<!DOCTYPE html><html>
<head><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#080c10; width:520px; height:320px; overflow:hidden;
    font-family:'Courier New',monospace; border:1px solid #e63946;
    box-shadow:0 0 60px rgba(230,57,70,0.4); border-radius:4px; }
  .scan { position:absolute; width:100%; height:2px; background:rgba(230,57,70,0.4);
    animation:scan 2s linear infinite; top:0; }
  @keyframes scan { 0%{top:0} 100%{top:100%} }
  .content { display:flex; flex-direction:column; align-items:center;
    justify-content:center; height:100%; gap:16px; padding:30px; }
  .logo { font-size:42px; font-weight:900; letter-spacing:6px; color:#fff; }
  .logo span { color:#e63946; text-shadow:0 0 20px rgba(230,57,70,0.8); }
  .ver { color:#3a4458; font-size:11px; letter-spacing:4px; }
  .tagline { color:#5a6478; font-size:10px; letter-spacing:2px; text-align:center; }
  .bar-wrap { width:380px; height:3px; background:#0d1520; border-radius:2px; overflow:hidden; }
  .bar { height:100%; background:linear-gradient(90deg,#e63946,#ff6b6b);
    animation:load 2.8s ease-in-out forwards; width:0%; border-radius:2px; }
  @keyframes load { 0%{width:0%} 60%{width:75%} 90%{width:92%} 100%{width:100%} }
  .status { color:#e63946; font-size:9px; letter-spacing:3px;
    animation:blink 0.8s ease-in-out infinite alternate; }
  @keyframes blink{from{opacity:0.4}to{opacity:1}}
  .cats { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
  .cat { font-size:8px; color:#2a3040; letter-spacing:1.5px; padding:2px 8px;
    border:1px solid #1a2030; border-radius:2px; }
  .cat.a { color:#e63946; border-color:#e6394633; }
  .corners .c { position:absolute; width:12px; height:12px; border-color:#e63946; border-style:solid; }
  .c.tl{top:8px;left:8px;border-width:2px 0 0 2px}
  .c.tr{top:8px;right:8px;border-width:2px 2px 0 0}
  .c.bl{bottom:8px;left:8px;border-width:0 0 2px 2px}
  .c.br{bottom:8px;right:8px;border-width:0 2px 2px 0}
</style></head>
<body>
  <div class="scan"></div>
  <div class="corners">
    <div class="c tl"></div><div class="c tr"></div>
    <div class="c bl"></div><div class="c br"></div>
  </div>
  <div class="content">
    <div class="logo">ANON<span>-IRAN</span></div>
    <div class="ver">v${APP_VERSION} &nbsp;·&nbsp; SECURITY PLATFORM</div>
    <div class="tagline">ARSENAL ✦ SWISS ARMY ✦ KALI ✦ PARROT ✦ OSINT ✦ FORENSICS</div>
    <div class="bar-wrap"><div class="bar"></div></div>
    <div class="status" id="s">INITIALIZING SECURE ENVIRONMENT...</div>
    <div class="cats">
      <span class="cat a">⚔ ARSENAL</span><span class="cat a">🪛 SWISS ARMY</span>
      <span class="cat">🐉 KALI</span><span class="cat">🦜 PARROT</span>
      <span class="cat">RECON</span><span class="cat">EXPLOIT</span>
      <span class="cat">FORENSICS</span><span class="cat">OSINT</span>
    </div>
  </div>
  <script>
    const msgs=['INITIALIZING SECURE ENVIRONMENT...','LOADING 531+ SECURITY TOOLS...','MOUNTING ARSENAL MODULES...','CONFIGURING SWISS ARMY TOOLKIT...','STARTING GUI ENGINE...','ACCESS GRANTED'];
    let i=0; setInterval(()=>{ document.getElementById('s').textContent=msgs[Math.min(++i,msgs.length-1)]; },480);
  </script>
</body></html>`)}`);
  return splash;
}

// ── Main window ──────────────────────────────────────────────────
function createMain() {
  mainWindow = new BrowserWindow({
    width: 1440, height: 900,
    minWidth: 1024, minHeight: 700,
    frame: false,
    backgroundColor: '#080c10',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => mainWindow.show(), 200);
  });

  mainWindow.on('closed', () => { mainWindow = null; app.quit(); });
}

// ── App lifecycle ─────────────────────────────────────────────────
app.whenReady().then(() => {
  // Build menu
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'App', submenu: [
      { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.reload() },
      { label: 'DevTools', accelerator: 'F12', click: () => mainWindow?.webContents.toggleDevTools() },
      { type: 'separator' },
      { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
    ]}
  ]));

  const splash = createSplash();
  setTimeout(() => {
    createMain();
    splash.close();
  }, 3000);
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ── IPC handlers ──────────────────────────────────────────────────
ipcMain.on('window-minimize',  () => mainWindow?.minimize());
ipcMain.on('window-maximize',  () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());
ipcMain.on('window-close',     () => { mainWindow?.close(); app.quit(); });
ipcMain.handle('window-is-max',() => mainWindow?.isMaximized());

ipcMain.handle('clipboard-write', (_, t) => { clipboard.writeText(t); return true; });
ipcMain.handle('clipboard-read',  ()  => clipboard.readText());

ipcMain.handle('open-url', (_, url) => { shell.openExternal(url); return true; });

ipcMain.handle('show-notification', (_, { title, body }) => {
  if (Notification.isSupported()) new Notification({ title, body }).show();
  return true;
});

ipcMain.handle('save-file', async (_, { content, defaultName, filters }) => {
  const r = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'anon-iran-export.txt',
    filters: filters || [{ name: 'Text', extensions: ['txt'] }, { name: 'All', extensions: ['*'] }]
  });
  if (!r.canceled && r.filePath) {
    require('fs').writeFileSync(r.filePath, content, 'utf-8');
    return { saved: true, path: r.filePath };
  }
  return { saved: false };
});

ipcMain.handle('get-system-info', () => ({
  hostname: os.hostname(),
  platform: os.platform(),
  arch: os.arch(),
  cpus: os.cpus().length,
  ram: Math.round(os.totalmem() / 1073741824) + ' GB',
  freeRam: Math.round(os.freemem() / 1073741824) + ' GB',
  uptime: Math.round(os.uptime() / 3600) + 'h',
  nodeVer: process.versions.node,
  electronVer: process.versions.electron || 'N/A',
  toolCount: 531,
  version: APP_VERSION,
  interfaces: Object.entries(os.networkInterfaces())
    .flatMap(([n, addrs]) => addrs.filter(a => !a.internal).map(a => ({ name: n, address: a.address, family: a.family })))
}));

ipcMain.handle('get-local-ip', () => {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.0.1';
});

ipcMain.handle('dns-lookup', async (_, { host, type }) => {
  return new Promise(resolve => {
    const method = type === 'MX' ? dns.resolveMx : type === 'NS' ? dns.resolveNs : dns.resolve4;
    method(host, (err, addrs) => resolve(err ? { error: err.message } : { addrs }));
  });
});

ipcMain.handle('tcp-check', async (_, { host, port }) => {
  return new Promise(resolve => {
    const sock = new net.Socket();
    sock.setTimeout(3000);
    sock.connect(port, host, () => { sock.destroy(); resolve({ open: true }); });
    sock.on('error', () => { sock.destroy(); resolve({ open: false }); });
    sock.on('timeout', () => { sock.destroy(); resolve({ open: false }); });
  });
});

ipcMain.handle('scan-ports', async (_, { host, ports }) => {
  const results = {};
  const batch = 60;
  for (let i = 0; i < ports.length; i += batch) {
    const chunk = ports.slice(i, i + batch);
    await Promise.all(chunk.map(p => new Promise(resolve => {
      const s = new net.Socket();
      s.setTimeout(1200);
      s.connect(p, host, () => { s.destroy(); results[p] = true; resolve(); });
      s.on('error', () => { s.destroy(); results[p] = false; resolve(); });
      s.on('timeout', () => { s.destroy(); results[p] = false; resolve(); });
    })));
  }
  return results;
});

const ALLOWED_CMDS = ['nmap', 'ping', 'tracert', 'traceroute', 'nslookup', 'whois',
  'host', 'dig', 'arp', 'netstat', 'ipconfig', 'ifconfig', 'curl', 'wget'];

ipcMain.handle('exec-command', async (_, cmd) => {
  const base = cmd.trim().split(/\s+/)[0].toLowerCase().replace(/.*[/\\]/, '');
  if (!ALLOWED_CMDS.includes(base)) return { error: 'Command not in allowlist: ' + base };
  return new Promise(resolve => {
    exec(cmd, { timeout: 15000 }, (err, stdout, stderr) => {
      resolve({ stdout: stdout || '', stderr: stderr || '', code: err?.code });
    });
  });
});
