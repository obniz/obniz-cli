"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const packageJson = require("../../package.json");
electron_1.contextBridge.exposeInMainWorld("electron", {
    systemVersion: () => packageJson.version,
    systemClose: async (arg) => await electron_1.ipcRenderer.invoke("system:close", arg),
    systemMaximize: async (arg) => await electron_1.ipcRenderer.invoke("system:maximize", arg),
    systemMinimize: async (arg) => await electron_1.ipcRenderer.invoke("system:minimize", arg),
    api_login: async (api_key) => await electron_1.ipcRenderer.invoke("obniz:api_login", { key: api_key }),
    login: async () => await electron_1.ipcRenderer.invoke("obniz:login", {}),
    loginError: async (func) => electron_1.ipcRenderer.on("error:invalidToken", (event, args) => func()),
    logout: async () => await electron_1.ipcRenderer.invoke("obniz:logout", {}),
    userinfo: () => electron_1.ipcRenderer.sendSync("obniz:userinfo", {}),
    devicePorts: () => electron_1.ipcRenderer.invoke("devices:list", {}),
    deviceUpdated: async (func) => electron_1.ipcRenderer.on("devices:update", (event, arg) => func(arg)),
    hardwares: () => electron_1.ipcRenderer.sendSync("obniz:hardwares", {}),
    versions: (hardware) => electron_1.ipcRenderer.sendSync("obniz:versions", { hardware }),
    erase: (args) => {
        return new Promise((resolve) => {
            electron_1.ipcRenderer.invoke("obniz:erase", args);
            electron_1.ipcRenderer.on("obniz:erased", (event, success) => {
                resolve(success);
            });
        });
    },
    flash: async (arg) => await electron_1.ipcRenderer.invoke("obniz:flash", arg),
    create: async (arg) => await electron_1.ipcRenderer.invoke("obniz:create", arg),
    config: async (arg) => await electron_1.ipcRenderer.invoke("obniz:config", arg),
    configViaWifi: async (arg) => await electron_1.ipcRenderer.invoke("obniz:config_via_wifi", arg),
    configViaWifiCancel: async (arg) => await electron_1.ipcRenderer.invoke("obniz:config_via_wifi:cancel", arg),
    proceed: async (func) => electron_1.ipcRenderer.on("write:proceed", (event, arg) => func(arg)),
    finished: async (func) => electron_1.ipcRenderer.on("obniz:finished", (event, arg) => func()),
    stderr: (func) => electron_1.ipcRenderer.on("console:stderr", (event, args) => func(args)),
    opendialog: () => electron_1.ipcRenderer.sendSync("json:open", {}),
    cmdError: (func) => electron_1.ipcRenderer.on("error:occurred", (event, args) => func()),
    externalLink: async (url) => await electron_1.ipcRenderer.invoke("link:open", { url }),
});
//# sourceMappingURL=preload.js.map