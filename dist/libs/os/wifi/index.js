"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const node_wifi_1 = __importDefault(require("node-wifi"));
const getora_1 = require("../../ora-console/getora");
const ora = getora_1.getOra();
const os_1 = require("os");
class WiFi {
    constructor(obj) {
        this.stdout = obj.stdout;
        this.onerror = obj.onerror;
        node_wifi_1.default.init({
            iface: null,
        });
    }
    async setNetwork(configs, duplicate = true, signal) {
        let spinner;
        const successIds = [];
        while (true) {
            try {
                if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                    break;
                }
                spinner = ora(`Wi-Fi Scanning...`).start();
                let networks;
                while (true) {
                    networks = await this.scanObnizWiFi(30 * 1000);
                    if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                        throw new Error(`Aborted.`);
                    }
                    if (networks.length === 0) {
                        continue;
                    }
                    break;
                }
                for (let i = 0; i < networks.length; i++) {
                    const network = networks[i];
                    if (!duplicate && successIds[network.ssid]) {
                        continue;
                    }
                    if (i !== 0) {
                        spinner = ora(``).start();
                    }
                    try {
                        // Connect access point
                        spinner.text = `Found ${chalk_1.default.green(network.ssid)}. Connecting...`;
                        try {
                            await node_wifi_1.default.connect({ ssid: network.ssid });
                        }
                        catch (e) {
                            throw new Error(`Connection to ${chalk_1.default.green(network.ssid)} failed`);
                        }
                        const destIP = guessObnizIP();
                        console.log(destIP);
                        spinner.text = `Connected ${chalk_1.default.green(network.ssid)}. IP=${destIP} Configuring...`;
                        if (destIP === "1.2.3.4" || destIP === "192.168.0.1") {
                            const succeed = await this.setForUnder350Devices(destIP, spinner, configs);
                            if (!succeed) {
                                continue;
                            }
                            spinner.succeed(`Configuration sent ${chalk_1.default.green(network.ssid)}`);
                        }
                        else {
                            const succeed = await this.setForEqualOrOver350Devices(destIP, spinner, configs);
                            if (!succeed) {
                                continue;
                            }
                            spinner.succeed(`Configuration Saved and Device Rebooted ${chalk_1.default.green(network.ssid)}`);
                        }
                        successIds[network.ssid] = true;
                    }
                    catch (e) {
                        spinner.fail(`${chalk_1.default.green(network.ssid)} Configuration failed reson=${e.toString()}`);
                    }
                }
            }
            catch (e) {
                spinner === null || spinner === void 0 ? void 0 : spinner.fail(`${e.toString()}`);
            }
        }
    }
    async setForUnder350Devices(targetIP, spinner, configs) {
        // Configure network via wifi
        const networks = configs.networks;
        if (!networks) {
            throw new Error(`please provide "networks". see more detail at example json file`);
        }
        if (!Array.isArray(networks)) {
            throw new Error(`"networks" must be an array`);
        }
        if (networks.length !== 1) {
            throw new Error(`"networks" must have single object in array.`);
        }
        const network = networks[0];
        const type = network.type;
        const setting = network.settings;
        let getCount = 0;
        let responseBody = "";
        while (true) {
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            });
            try {
                const httpResponse = await new Promise((resolve, reject) => {
                    const timeout = 3000;
                    setTimeout(() => {
                        reject(new Error(`Timed out ${timeout}`));
                    }, timeout);
                    fetch(`http://${targetIP}/`)
                        .then((result) => {
                        resolve(result);
                    })
                        .catch((e) => {
                        reject(e);
                    });
                });
                if (httpResponse.ok) {
                    responseBody = await httpResponse.text();
                    break;
                }
            }
            catch (e) {
                // ignore fetching error
            }
            ++getCount;
            spinner.text = `${chalk_1.default.green(network.ssid)} Connecting HTTP Server... ${getCount}`;
            if (getCount >= 4) {
                throw new Error(`${chalk_1.default.green(network.ssid)} HTTP Communication Failed ${getCount} times. abort`);
            }
        }
        if (this.isSettingMode(responseBody)) {
            await this.sendReset(spinner, network.ssid);
            spinner.succeed(`Network Reset done. ${chalk_1.default.green(network.ssid)}`);
            return false;
        }
        // Send HTTP Request
        let url = "http://192.168.0.1/";
        if (type === "wifi") {
            url = "http://192.168.0.1/";
        }
        else if (type === "cellular") {
            url = "http://192.168.0.1/lte";
        }
        else if (type === "wifimesh") {
            url = "http://192.168.0.1/mesh";
        }
        const options = this.createSettingData(type, setting);
        const res = await fetch(url, options);
        if (res.status !== 200) {
            throw new Error(`Configuration failed ${chalk_1.default.green(network.ssid)}`);
        }
        return true;
    }
    /**
     * setting configration for OS3.5.0 or older
     * @param spinner Ora object
     * @param configs json user set
     * @returns
     */
    async setForEqualOrOver350Devices(targetIP, spinner, configs) {
        // Configure network via wifi
        let getCount = 0;
        const responseBody = "";
        // Login Loop
        spinner.text = `Logining...`;
        while (true) {
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            });
            try {
                const res = await new Promise((resolve, reject) => {
                    const timeout = 3000;
                    setTimeout(() => {
                        reject(new Error(`Timed out ${timeout}`));
                    }, timeout);
                    fetch(`http://${targetIP}/api/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json;charset=utf-8",
                        },
                        body: JSON.stringify({ passkey: "obniz" }),
                    })
                        .then((result) => {
                        resolve(result);
                    })
                        .catch((e) => {
                        reject(e);
                    });
                });
                if (res.status === 404) {
                    // already logged in
                    break;
                }
                if (res.status !== 200) {
                    throw new Error(`Can't Logged In`);
                }
                break;
            }
            catch (e) {
                // throw new Error(`Login Error`)
            }
            ++getCount;
            spinner.text = `Accessing and Logining... ${getCount}`;
            if (getCount >= 4) {
                throw new Error(`Login Failed ${getCount} times. abort`);
            }
        }
        // after login
        spinner.text = `Sending JSON`;
        const setRes = await fetch(`http://${targetIP}/api/setting`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(configs),
        });
        if (setRes.status !== 201) {
            throw new Error(`Configration Failed with status ${setRes.status}`);
        }
        const options = {
            method: "POST",
        };
        spinner.text = `Rebooting`;
        const params = new URLSearchParams();
        params.append("mode", "reboot");
        options.body = params;
        // this will never done. because device will reboot
        fetch(`http://${targetIP}/setting`, options).then();
        return true;
    }
    isSettingMode(responseBody) {
        return responseBody.indexOf(`Normal Launch`) >= 0;
    }
    async sendReset(spinner, identifier) {
        // reset_all
        const options = this.createResetData();
        const res = await fetch("http://192.168.0.1/", options);
        if (res.status !== 200) {
            throw new Error(`Resetting Network failed ${chalk_1.default.green(identifier)}`);
        }
    }
    /**
     * リセットリクエストを送りWi-Fi設定モードに遷移させる
     * @returns
     */
    createResetData() {
        const options = {
            method: "POST",
        };
        const urlSetting = {
            mode: "reset_all",
        };
        const params = new URLSearchParams();
        Object.keys(urlSetting).forEach((key) => params.append(key, urlSetting[key]));
        options.body = params;
        return options;
    }
    /**
     * ネットワーク設定を送る
     * @param type
     * @param setting
     * @returns
     */
    createSettingData(type, setting) {
        const options = {
            method: "POST",
        };
        if (type === "wifi") {
            const urlSetting = {
                ssid: "other",
                input_ssid: setting.ssid,
                pw: setting.password,
                si: "",
                nm: "",
                gw: "",
                ds: "",
                proxy_ip: "",
                proxy_port: "",
            };
            if (setting.dhcp === false) {
                urlSetting.si = setting.static_ip;
                urlSetting.nm = setting.subnetmask;
                urlSetting.gw = setting.default_gateway;
                urlSetting.ds = setting.dns;
            }
            if (setting.proxy) {
                urlSetting.proxy_ip = setting.proxy_address;
                urlSetting.proxy_port = setting.proxy_port;
            }
            const params = new URLSearchParams();
            Object.keys(urlSetting).forEach((key) => params.append(key, urlSetting[key]));
            options.body = params;
        }
        else if (type === "wifimesh") {
            const urlSetting = {
                ssid: "other",
                input_ssid: setting.ssid,
                pw: setting.password,
                meshid: "",
                si: "",
                nm: "",
                gw: "",
                ds: "",
                proxy_ip: "",
                proxy_port: "",
            };
            if (setting.dhcp === false) {
                urlSetting.si = setting.static_ip;
                urlSetting.nm = setting.subnetmask;
                urlSetting.gw = setting.default_gateway;
                urlSetting.ds = setting.dns;
            }
            if (setting.proxy) {
                urlSetting.proxy_ip = setting.proxy_address;
                urlSetting.proxy_port = setting.proxy_port;
            }
            if (setting.meshid) {
                urlSetting.meshid = setting.meshid;
            }
            const params = new URLSearchParams();
            Object.keys(urlSetting).forEach((key) => params.append(key, urlSetting[key]));
            options.body = params;
        }
        else if (type === "cellular") {
            const urlSetting = setting;
            const params = new URLSearchParams();
            Object.keys(urlSetting).forEach((key) => params.append(key, urlSetting[key]));
            options.body = params;
        }
        return options;
    }
    scanObnizWiFi(timeout, signal) {
        return new Promise(async (resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Timeout. Cannot find any connectable obniz.`));
            }, timeout);
            signal === null || signal === void 0 ? void 0 : signal.addEventListener("abort", () => {
                clearTimeout(timer);
                reject(new Error(`Aborted.`));
            });
            node_wifi_1.default.scan((error, networks) => {
                if (error) {
                    clearTimeout(timer);
                    reject(error);
                    return;
                }
                const obnizwifis = [];
                for (const network of networks) {
                    const re = /^obniz-[0-9]{8}/;
                    if (re.test(network.ssid)) {
                        obnizwifis.push(network);
                    }
                }
                clearTimeout(timer);
                resolve(obnizwifis);
            });
        });
    }
}
exports.default = WiFi;
function currentLocalIP() {
    const nets = os_1.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === "IPv4" && !net.internal) {
                if (net.address.startsWith("192.168") || net.address.startsWith("1.2.3.")) {
                    return net.address;
                }
            }
        }
    }
    // obnizOS 3.5.0 standard
    return "192.168.254.2";
}
function guessObnizIP() {
    const ip = currentLocalIP();
    if (ip === "1.2.3.5") {
        return "1.2.3.4";
    }
    else if (ip === "192.168.0.2") {
        return "192.168.0.1";
    }
    else {
        return "192.168.254.1";
    }
}
//# sourceMappingURL=index.js.map