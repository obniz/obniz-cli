"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const express_1 = __importDefault(require("express"));
const get_port_1 = __importDefault(require("get-port"));
const http_1 = __importDefault(require("http"));
const path = __importStar(require("path"));
const sdk_1 = require("../libs/obnizio/sdk");
const user_1 = __importDefault(require("../libs/obnizio/user"));
const config_1 = __importDefault(require("../libs/os/config"));
const erase_1 = __importDefault(require("../libs/os/erase"));
const flash_1 = __importDefault(require("../libs/os/flash"));
const flashcreate_1 = __importDefault(require("../libs/os/flashcreate"));
const guess_1 = __importDefault(require("../libs/os/serial/guess"));
const os_1 = __importDefault(require("../libs/obnizio/os"));
const Storage = __importStar(require("../libs/storage"));
const login_1 = __importDefault(require("../libs/user/login"));
const logout_1 = __importDefault(require("../libs/user/logout"));
const electron_log_1 = __importDefault(require("electron-log"));
const electron_updater_1 = require("electron-updater");
const config_via_wifi_1 = __importDefault(require("../libs/os/config_via_wifi"));
const originalStderrWrite = process.stderr.write.bind(process.stderr);
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const api_key = null;
// stdout, stderrをRendererにも送る
function forwardOutput(enable) {
    if (enable) {
        process.stderr.write = (chunk) => {
            mainWindow.webContents.send("console:stderr", chunk);
            return originalStderrWrite(chunk);
        };
        process.stdout.write = (chunk) => {
            mainWindow.webContents.send("console:stderr", chunk);
            return originalStdoutWrite(chunk);
        };
    }
    else {
        process.stderr.write = originalStderrWrite;
        process.stdout.write = originalStdoutWrite;
    }
}
async function setupServer() {
    const expressApp = express_1.default();
    const port = await get_port_1.default();
    expressApp.set("port", port);
    const staticPath = path.join(__dirname, "../../public");
    expressApp.use(express_1.default.static(staticPath));
    const server = http_1.default.createServer(expressApp);
    await new Promise((resolve, reject) => {
        server.on("error", (e) => {
            reject(e);
        });
        server.on("listening", () => {
            console.log(`listening on http://localhost:${port} ${staticPath}`);
            resolve(null);
        });
        server.listen(port);
    });
    return { port };
}
let mainWindow = null;
electron_1.app.on("ready", async () => {
    mainWindow = new electron_1.BrowserWindow({
        width: 980,
        height: 720,
        minWidth: 980,
        minHeight: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, "preload.js"),
        },
    });
    if (!mainWindow) {
        return;
    }
    const { port } = await setupServer();
    const rendererHost = `http://localhost:${port}`;
    // const rendererHost = `http://localhost:3000/cli`;
    const indexPageUrl = `${rendererHost}/index.html`;
    const mainPageUrl = `${rendererHost}/main.html`;
    // Electronに表示するhtmlを絶対パスで指定（相対パスだと動かない）
    // ChromiumのDevツールを開く
    if (process.env.DEV_TOOL === "open") {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    electron_1.ipcMain.handle("system:close", async (event, arg) => {
        electron_1.app.quit();
    });
    electron_1.ipcMain.handle("system:maximize", async (event, arg) => {
        mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
    });
    electron_1.ipcMain.handle("system:minimize", async (event, arg) => {
        mainWindow.minimize();
    });
    electron_1.ipcMain.handle("link:open", async (event, arg) => {
        await electron_1.shell.openExternal(arg.url);
    });
    electron_1.ipcMain.handle("obniz:api_login", async (event, arg) => {
        const sdk = sdk_1.getClientSdk(arg.key);
        sdk
            .getTokenPermission()
            .then((res) => {
            if (res.token.device !== "none") {
                Storage.set("token", api_key);
                mainWindow.loadURL(mainPageUrl);
            }
            else {
                mainWindow.webContents.send("error:invalidToken");
            }
        })
            .catch((e) => {
            throw e;
        });
    });
    electron_1.ipcMain.handle("obniz:login", async (event, arg) => {
        await login_1.default({
            id: "wa_MTEzNzU=",
            token: "apptoken_kxDRfltfCETiQbiCKUOju1vQpA_2uj9ux7rMTyTeVevvV2RKcQ2nxsphj4f8D94n",
        });
        // mainWindow!.loadURL(`${rendererHost}/settings.html`);
        await mainWindow.loadURL(mainPageUrl);
    });
    electron_1.ipcMain.handle("obniz:logout", async (event, arg) => {
        await logout_1.default();
        await mainWindow.loadURL(indexPageUrl);
    });
    electron_1.ipcMain.handle("obniz:flash", async (event, arg) => {
        forwardOutput(true);
        await flash_1.default.execute({
            port: arg.device,
            baud: parseInt(arg.baudrate),
            version: arg.os_ver,
            stdout: process.stdout.write,
            hardware: arg.hardware,
            debugserial: false,
            skiprecovery: true,
        }, (i) => {
            mainWindow.webContents.send("write:proceed", i);
        }).catch((e) => {
            console.log(e);
            mainWindow.webContents.send("error:occurred");
        });
        forwardOutput(false);
        mainWindow.webContents.send("obniz:finished");
    });
    electron_1.ipcMain.handle("obniz:erase", async (event, arg) => {
        erase_1.default({
            portname: arg.device,
            baud: arg.baudrate,
            stdout: (text) => {
                process.stdout.write(text);
            },
        })
            .then((success) => {
            mainWindow.webContents.send("obniz:erased", success);
        })
            .catch((e) => {
            mainWindow.webContents.send("obniz:erased", e.message);
            // throw e;
        });
    });
    electron_1.ipcMain.handle("obniz:create", async (event, arg) => {
        const token = Storage.get("token");
        const params = {
            token,
            port: arg.device,
            portname: arg.device,
            baud: arg.baudrate,
            hardware: arg.hardware,
            version: arg.os_ver,
            skiprecovery: true,
        };
        if (arg.description) {
            params.description = arg.description;
        }
        if (arg.config_json) {
            params.config = arg.config_json;
        }
        if (arg.opname) {
            params.operation = arg.opname;
        }
        if (arg.indication_id) {
            params.indication = arg.indication_id;
        }
        if (arg.qrcode) {
            params.bindtoken = true;
            params.serial_token = arg.qrcode;
        }
        if (arg.obniz_id) {
            params.obniz_id = arg.obniz_id;
        }
        forwardOutput(true);
        await flashcreate_1.default.execute(params, (i) => {
            mainWindow.webContents.send("write:proceed", i);
        }).catch((e) => {
            console.log(e);
            mainWindow.webContents.send("error:occurred");
        });
        forwardOutput(false);
        mainWindow.webContents.send("obniz:finished");
    });
    electron_1.ipcMain.handle("obniz:config", async (event, arg) => {
        const token = Storage.get("token");
        const params = {
            token,
            port: arg.device,
            portname: arg.device,
            baud: arg.baudrate,
        };
        if (arg.description) {
            params.description = arg.description;
        }
        if (arg.config_json) {
            params.config = arg.config_json;
        }
        if (arg.opname) {
            params.operation = arg.opname;
        }
        if (arg.indication_id) {
            params.indication = arg.indication_id;
        }
        forwardOutput(true);
        await config_1.default.execute(params, (i) => {
            mainWindow.webContents.send("write:proceed", i);
        }).catch((e) => {
            console.log(e);
            mainWindow.webContents.send("error:occurred", {});
        });
        forwardOutput(false);
        mainWindow.webContents.send("obniz:finished");
    });
    let abortController = null;
    electron_1.ipcMain.handle("obniz:config_via_wifi", async (event, arg) => {
        forwardOutput(true);
        abortController = new AbortController();
        const signal = abortController.signal;
        await config_via_wifi_1.default.execute(arg, signal);
        forwardOutput(false);
    });
    electron_1.ipcMain.handle("obniz:config_via_wifi:cancel", async (event, arg) => {
        forwardOutput(false);
        abortController === null || abortController === void 0 ? void 0 : abortController.abort();
    });
    electron_1.ipcMain.on("obniz:userinfo", async (event, arg) => {
        try {
            const token = Storage.get("token");
            if (token) {
                const user = await user_1.default(token);
                if (user) {
                    event.returnValue = { name: user.name, email: user.email };
                }
            }
            else {
                event.returnValue = {};
            }
        }
        catch (e) {
            throw e;
        }
    });
    electron_1.ipcMain.on("obniz:hardwares", async (event, arg) => {
        const hardwares = await os_1.default.hardwares();
        event.returnValue = hardwares;
    });
    electron_1.ipcMain.on("obniz:versions", async (event, arg) => {
        const versions = await os_1.default.list(arg.hardware);
        event.returnValue = versions;
    });
    async function monitorSerialPorts() {
        let portsInfo = await guess_1.default();
        let ports = null;
        while (true) {
            portsInfo = await guess_1.default();
            if (JSON.stringify(portsInfo.ports) !== JSON.stringify(ports)) {
                ports = portsInfo.ports;
                try {
                    mainWindow.webContents.send("devices:update", { ports: portsInfo.ports, selected: portsInfo.portname });
                }
                catch (e) {
                    // nothing
                }
            }
            await new Promise((resolve) => {
                setTimeout(resolve, 100);
            });
            ports = portsInfo.ports;
        }
    }
    let isDeviceListLoopStarted = false;
    electron_1.ipcMain.handle("devices:list", async (event, arg) => {
        if (isDeviceListLoopStarted) {
            const portsInfo = await guess_1.default();
            try {
                mainWindow.webContents.send("devices:update", { ports: portsInfo.ports, selected: portsInfo.portname });
            }
            catch (e) { }
            return;
        }
        isDeviceListLoopStarted = true;
        const hop = async () => {
            try {
                await monitorSerialPorts();
            }
            catch (e) {
                setTimeout(hop, 1000);
            }
        };
        hop().catch(() => { });
    });
    electron_1.ipcMain.on("json:open", async (event, arg) => {
        electron_1.dialog
            .showOpenDialog(mainWindow, {
            filters: [{ name: "obniz Configuration File", extensions: ["json"] }],
            properties: ["openFile"],
        })
            .then((result) => {
            const filePaths = result.filePaths;
            if (filePaths.length !== 0) {
                // ファイル読み込み
                console.log(filePaths[0]);
                event.returnValue = filePaths[0];
            }
            else {
                event.returnValue = null;
            }
        });
    });
    await setupAutoUpdater();
    try {
        const token = Storage.get("token");
        if (token) {
            const user = await user_1.default(token);
            if (user) {
                await mainWindow.loadURL(mainPageUrl);
            }
        }
        else {
            await mainWindow.loadURL(indexPageUrl);
        }
    }
    catch (e) {
        await mainWindow.loadURL(indexPageUrl);
    }
});
process.on("exit", () => {
    console.log("exit");
});
const setupAutoUpdater = async () => {
    // -------------------------------------------
    // 自動アップデート関連のイベント処理
    // -------------------------------------------
    const options = {
        provider: "s3",
        bucket: "obniz-writer",
        region: "ap-northeast-1",
        acl: "public-read",
        storageClass: "STANDARD",
    };
    let autoUpdater = null;
    if (process.platform === "win32") {
        autoUpdater = new electron_updater_1.NsisUpdater(Object.assign(Object.assign({}, options), { path: "/win32/" }));
    }
    else if (process.platform === "darwin") {
        autoUpdater = new electron_updater_1.MacUpdater(Object.assign(Object.assign({}, options), { path: "/mac/" }));
    }
    else {
        autoUpdater = new electron_updater_1.AppImageUpdater(Object.assign(Object.assign({}, options), { path: "/linux/" }));
    }
    // アップデートをチェック開始
    autoUpdater.on("checking-for-update", () => {
        electron_log_1.default.info(process.pid, "checking-for-update...");
    });
    // アップデートが見つかった
    autoUpdater.on("update-available", (ev, info) => {
        electron_log_1.default.info(process.pid, "Update available.");
    });
    // アップデートがなかった（最新版だった）
    autoUpdater.on("update-not-available", (ev, info) => {
        electron_log_1.default.info(process.pid, "Update not available.");
    });
    // アップデートのダウンロードが完了
    autoUpdater.on("update-downloaded", (info) => {
        const dialogOpts = {
            type: "info",
            buttons: ["Update and restart", "Later"],
            message: "Update",
            detail: "New version is available. Would you like to reboot and apply the update?",
        };
        // ダイアログを表示しすぐに再起動するか確認
        electron_1.dialog.showMessageBox(mainWindow, dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });
    // エラーが発生
    autoUpdater.on("error", (err) => {
        electron_log_1.default.error(process.pid, err);
    });
    // アップデートをチェック
    await autoUpdater.checkForUpdatesAndNotify();
};
//# sourceMappingURL=main.js.map