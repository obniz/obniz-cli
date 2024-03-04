import child_process from "child_process";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { AppUpdater } from "electron-updater/out/AppUpdater";
import { BaseUpdater } from "electron-updater/out/BaseUpdater";
import express from "express";
import getPort from "get-port";
import http from "http";
import * as path from "path";

import SerialPort from "serialport";
import Device from "../libs/obnizio/device";
import { getClientSdk } from "../libs/obnizio/sdk";
import User from "../libs/obnizio/user";
import Config from "../libs/os/config";
import Erase from "../libs/os/erase";
import Flash from "../libs/os/flash";
import Create from "../libs/os/flashcreate";
import guessPort from "../libs/os/serial/guess";

import OS from "../libs/obnizio/os";
import PreparePort from "../libs/os/serial/prepare";
import * as Storage from "../libs/storage";
import Login from "../libs/user/login";
import Logout from "../libs/user/logout";

import log from "electron-log";
import { AppImageUpdater, MacUpdater, NsisUpdater } from "electron-updater";
import Config_via_wifi from "../libs/os/config_via_wifi";

const originalStderrWrite = process.stderr.write.bind(process.stderr);
const originalStdoutWrite = process.stdout.write.bind(process.stdout);

const api_key: string | null = null;

// stdout, stderrをRendererにも送る
function forwardOutput(enable: boolean): void {
  if (enable) {
    process.stderr.write = (chunk: string | Uint8Array) => {
      mainWindow!.webContents.send("console:stderr", chunk);
      return originalStderrWrite(chunk);
    };
    process.stdout.write = (chunk: string | Uint8Array) => {
      mainWindow!.webContents.send("console:stderr", chunk);
      return originalStdoutWrite(chunk);
    };
  } else {
    process.stderr.write = originalStderrWrite;
    process.stdout.write = originalStdoutWrite;
  }
}

async function setupServer() {
  const expressApp = express();
  const port = await getPort();

  expressApp.set("port", port);
  const staticPath = path.join(__dirname, "../../public");
  expressApp.use(express.static(staticPath));

  const server = http.createServer(expressApp);

  await new Promise((resolve, reject) => {
    server.on("error", (e: any) => {
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

let mainWindow: Electron.BrowserWindow | null = null;
app.on("ready", async () => {
  mainWindow = new BrowserWindow({
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
    mainWindow!.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  ipcMain.handle("system:close", async (event: any, arg: any) => {
    app.quit();
  });
  ipcMain.handle("system:maximize", async (event: any, arg: any) => {
    mainWindow!.isMaximized() ? mainWindow!.unmaximize() : mainWindow!.maximize();
  });
  ipcMain.handle("system:minimize", async (event: any, arg: any) => {
    mainWindow!.minimize();
  });

  ipcMain.handle("link:open", async (event: any, arg: any) => {
    await shell.openExternal(arg.url);
  });

  ipcMain.handle("obniz:api_login", async (event: any, arg: any) => {
    const sdk = getClientSdk(arg.key);
    sdk
      .getTokenPermission()
      .then((res) => {
        if (res!.token!.device !== "none") {
          Storage.set("token", api_key);
          mainWindow!.loadURL(mainPageUrl);
        } else {
          mainWindow!.webContents.send("error:invalidToken");
        }
      })
      .catch((e) => {
        throw e;
      });
  });

  ipcMain.handle("obniz:login", async (event: any, arg: any) => {
    await Login({
      id: "wa_MTEzNzU=",
      token: "apptoken_kxDRfltfCETiQbiCKUOju1vQpA_2uj9ux7rMTyTeVevvV2RKcQ2nxsphj4f8D94n",
    });
    // mainWindow!.loadURL(`${rendererHost}/settings.html`);
    await mainWindow!.loadURL(mainPageUrl);
  });
  ipcMain.handle("obniz:logout", async (event: any, arg: any) => {
    await Logout();
    await mainWindow!.loadURL(indexPageUrl);
  });

  ipcMain.handle("obniz:flash", async (event: any, arg: any) => {
    forwardOutput(true);
    await Flash.execute(
      {
        port: arg.device,
        baud: parseInt(arg.baudrate),
        version: arg.os_ver,
        stdout: process.stdout.write,
        hardware: arg.hardware,
        debugserial: false,
        skiprecovery: true,
      },
      (i: number) => {
        mainWindow!.webContents.send("write:proceed", i);
      },
    ).catch((e) => {
      console.log(e);
      mainWindow!.webContents.send("error:occurred");
    });
    forwardOutput(false);
    mainWindow!.webContents.send("obniz:finished");
  });

  ipcMain.handle("obniz:erase", async (event: any, arg: any) => {
    Erase({
      portname: arg.device,
      baud: arg.baudrate,
      stdout: (text: string) => {
        process.stdout.write(text);
      },
    })
      .then((success) => {
        mainWindow!.webContents.send("obniz:erased", success);
      })
      .catch((e) => {
        mainWindow!.webContents.send("obniz:erased", e.message);
        // throw e;
      });
  });

  ipcMain.handle("obniz:create", async (event: any, arg: any) => {
    const token = Storage.get("token");
    const params: any = {
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
    await Create.execute(params, (i: number) => {
      mainWindow!.webContents.send("write:proceed", i);
    }).catch((e) => {
      console.log(e);
      mainWindow!.webContents.send("error:occurred");
    });
    forwardOutput(false);
    mainWindow!.webContents.send("obniz:finished");
  });

  ipcMain.handle("obniz:config", async (event: any, arg: any) => {
    const token = Storage.get("token");
    const params: any = {
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
    await Config.execute(params, (i: number) => {
      mainWindow!.webContents.send("write:proceed", i);
    }).catch((e) => {
      console.log(e);
      mainWindow!.webContents.send("error:occurred", {});
    });
    forwardOutput(false);
    mainWindow!.webContents.send("obniz:finished");
  });

  let abortController: AbortController | null = null;

  ipcMain.handle("obniz:config_via_wifi", async (event: any, arg: any) => {
    forwardOutput(true);
    abortController = new AbortController();
    const signal = abortController.signal;
    await Config_via_wifi.execute(arg, signal);
    forwardOutput(false);
  });

  ipcMain.handle("obniz:config_via_wifi:cancel", async (event: any, arg: any) => {
    forwardOutput(false);
    abortController?.abort();
  });

  ipcMain.on("obniz:userinfo", async (event: any, arg: any) => {
    try {
      const token = Storage.get("token");
      if (token) {
        const user = await User(token);
        if (user) {
          event.returnValue = { name: user!.name, email: user!.email };
        }
      } else {
        event.returnValue = {};
      }
    } catch (e) {
      throw e;
    }
  });

  ipcMain.on("obniz:hardwares", async (event: any, arg: any) => {
    const hardwares = await OS.hardwares();
    event.returnValue = hardwares;
  });

  ipcMain.on("obniz:versions", async (event: any, arg: any) => {
    const versions = await OS.list(arg.hardware);
    event.returnValue = versions;
  });

  async function monitorSerialPorts() {
    let portsInfo = await guessPort();
    let ports: SerialPort.PortInfo[] | null = null;
    while (true) {
      portsInfo = await guessPort();

      if (JSON.stringify(portsInfo.ports) !== JSON.stringify(ports)) {
        ports = portsInfo.ports;
        try {
          mainWindow!.webContents.send("devices:update", { ports: portsInfo.ports, selected: portsInfo.portname });
        } catch (e) {
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
  ipcMain.handle("devices:list", async (event: any, arg: any) => {
    if (isDeviceListLoopStarted) {
      const portsInfo = await guessPort();
      try {
        mainWindow!.webContents.send("devices:update", { ports: portsInfo.ports, selected: portsInfo.portname });
      } catch (e) {}
      return;
    }
    isDeviceListLoopStarted = true;

    const hop = async () => {
      try {
        await monitorSerialPorts();
      } catch (e) {
        setTimeout(hop, 1000);
      }
    };

    hop().catch(() => {});
  });

  ipcMain.on("json:open", async (event: any, arg: any) => {
    dialog
      .showOpenDialog(mainWindow!, {
        filters: [{ name: "obniz Configuration File", extensions: ["json"] }],
        properties: ["openFile"],
      })
      .then((result: any) => {
        const filePaths = result.filePaths;
        if (filePaths.length !== 0) {
          // ファイル読み込み
          console.log(filePaths[0]);
          event.returnValue = filePaths[0];
        } else {
          event.returnValue = null;
        }
      });
  });

  await setupAutoUpdater();

  try {
    const token = Storage.get("token");
    if (token) {
      const user = await User(token);
      if (user) {
        await mainWindow!.loadURL(mainPageUrl);
      }
    } else {
      await mainWindow.loadURL(indexPageUrl);
    }
  } catch (e) {
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
  } as const;
  let autoUpdater: AppUpdater | null = null;
  if (process.platform === "win32") {
    autoUpdater = new NsisUpdater({ ...options, path: "/win32/" });
  } else if (process.platform === "darwin") {
    autoUpdater = new MacUpdater({ ...options, path: "/mac/" });
  } else {
    autoUpdater = new AppImageUpdater({ ...options, path: "/linux/" });
  }
  // アップデートをチェック開始
  autoUpdater.on("checking-for-update", () => {
    log.info(process.pid, "checking-for-update...");
  });
  // アップデートが見つかった
  autoUpdater.on("update-available", (ev, info) => {
    log.info(process.pid, "Update available.");
  });
  // アップデートがなかった（最新版だった）
  autoUpdater.on("update-not-available", (ev, info) => {
    log.info(process.pid, "Update not available.");
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
    dialog.showMessageBox(mainWindow!, dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater!.quitAndInstall();
      }
    });
  });
  // エラーが発生
  autoUpdater.on("error", (err) => {
    log.error(process.pid, err);
  });

  // アップデートをチェック
  await autoUpdater.checkForUpdatesAndNotify();
};
