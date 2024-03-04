import { contextBridge, ipcRenderer } from "electron";
const packageJson = require("../../package.json");

contextBridge.exposeInMainWorld("electron", {
  systemVersion: () => packageJson.version,
  systemClose: async (arg: any) => await ipcRenderer.invoke("system:close", arg),
  systemMaximize: async (arg: any) => await ipcRenderer.invoke("system:maximize", arg),
  systemMinimize: async (arg: any) => await ipcRenderer.invoke("system:minimize", arg),

  api_login: async (api_key: string) => await ipcRenderer.invoke("obniz:api_login", { key: api_key }),
  login: async () => await ipcRenderer.invoke("obniz:login", {}),

  loginError: async (func: () => void) => ipcRenderer.on("error:invalidToken", (event, args) => func()),
  logout: async () => await ipcRenderer.invoke("obniz:logout", {}),

  userinfo: () => ipcRenderer.sendSync("obniz:userinfo", {}),

  devicePorts: () => ipcRenderer.invoke("devices:list", {}),
  deviceUpdated: async (func: (args: any) => void) => ipcRenderer.on("devices:update", (event, arg) => func(arg)),
  hardwares: () => ipcRenderer.sendSync("obniz:hardwares", {}),
  versions: (hardware: string) => ipcRenderer.sendSync("obniz:versions", { hardware }),

  erase: (args: any) => {
    return new Promise((resolve) => {
      ipcRenderer.invoke("obniz:erase", args);
      ipcRenderer.on("obniz:erased", (event, success) => {
        resolve(success);
      });
    });
  },
  flash: async (arg: any) => await ipcRenderer.invoke("obniz:flash", arg),
  create: async (arg: any) => await ipcRenderer.invoke("obniz:create", arg),
  config: async (arg: any) => await ipcRenderer.invoke("obniz:config", arg),
  configViaWifi: async (arg: any) => await ipcRenderer.invoke("obniz:config_via_wifi", arg),
  configViaWifiCancel: async (arg: any) => await ipcRenderer.invoke("obniz:config_via_wifi:cancel", arg),

  proceed: async (func: (args: number) => void) => ipcRenderer.on("write:proceed", (event, arg) => func(arg)),
  finished: async (func: () => void) => ipcRenderer.on("obniz:finished", (event, arg) => func()),

  stderr: (func: (args: string | Uint8Array) => void) => ipcRenderer.on("console:stderr", (event, args) => func(args)),

  opendialog: () => ipcRenderer.sendSync("json:open", {}),
  cmdError: (func: () => void) => ipcRenderer.on("error:occurred", (event, args) => func()),

  externalLink: async (url: string) => await ipcRenderer.invoke("link:open", { url }),
});
