"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const semver_1 = __importDefault(require("semver"));
const serial_1 = __importDefault(require("../serial"));
const ora_1 = __importDefault(require("ora"));
exports.default = async (obj) => {
    // Return if no configs required
    if (!obj.configs) {
        return;
    }
    const serial = new serial_1.default({
        portname: obj.portname,
        stdout: (text) => {
            if (obj.debugserial) {
                console.log(text);
            }
            received += text;
            obj.stdout(text);
        },
        onerror: (err) => {
            received += err;
            console.log(serial.totalReceived);
            throw new Error(`${err}`);
        },
        progress: (text, option = {}) => {
            if (obj.debugserial) {
                console.log(text);
                return;
            }
            if (option.keep) {
                spinner.text = text;
            }
            else {
                spinner = nextSpinner(spinner, `Configure: ${text}`, obj.debugserial);
            }
        },
    });
    let received = "";
    let spinner = ora_1.default(`Configure: Opening Serial Port ${chalk_1.default.green(obj.portname)}`).start();
    if (obj.debugserial) {
        spinner.stop();
    }
    try {
        await serial.open();
        // config devicekey
        if (obj.configs.devicekey) {
            await serial.setDeviceKey(obj.configs.devicekey);
        }
        // config network
        if (obj.configs.config) {
            // JSON provided by user
            const userconf = obj.configs.config;
            // detect Target obnizOS
            const info = await serial.detectedObnizOSVersion();
            spinner.succeed(`Configure: Detect Target obnizOS. version=${chalk_1.default.green(info.version)} ${chalk_1.default.green(info.obnizid)}`);
            if (semver_1.default.satisfies(info.version, ">=3.5.0")) {
                // menu mode and json flashing enabled device.
                if (userconf.networks) {
                    throw new Error(`You can't use older version of network configration json file.`);
                }
                await serial.setAllFromMenu(userconf);
            }
            else {
                // virtual UI.
                const networks = userconf.networks;
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
                const settings = network.settings;
                await serial.setNetworkType(type);
                if (type === "wifi") {
                    await serial.setWiFi(settings);
                }
                else {
                    spinner.fail(`Configure: Not Supported Network Type ${type}`);
                    throw new Error(`obniz-cli not supporting settings for ${type} right now. wait for future release`);
                }
            }
        }
        await serial.close();
    }
    catch (e) {
        console.log(received);
        spinner.fail(`Configure: Failed ${e}`);
        throw e;
    }
    spinner.succeed(`Configure: Success`);
};
function nextSpinner(spinner, text, debugserial) {
    spinner.succeed();
    spinner = ora_1.default(text).start();
    if (debugserial) {
        spinner.stop();
    }
    return spinner;
}
