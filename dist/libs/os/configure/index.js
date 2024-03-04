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
const chalk_1 = __importDefault(require("chalk"));
const semver_1 = __importDefault(require("semver"));
const operation_result_1 = require("../../obnizio/operation_result");
const operation_setting_1 = require("../../obnizio/operation_setting");
const Storage = __importStar(require("../../storage"));
const serial_1 = __importDefault(require("../serial"));
const getora_1 = require("../../ora-console/getora");
const ora = getora_1.getOra();
exports.default = async (obj) => {
    var _a, _b;
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
    let spinner = ora(`Configure: Opening Serial Port ${chalk_1.default.green(obj.portname)}`).start();
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
            // detect Target obnizOS
            const info = await serial.detectedObnizOSVersion();
            spinner.succeed(`Configure: Detect Target obnizOS. version=${chalk_1.default.green(info.version)} ${chalk_1.default.green(info.obnizid)}`);
            if (semver_1.default.satisfies(info.version, ">=3.5.0")) {
                if ("networks" in obj.configs.config) {
                    throw new Error(`You can't use older version of network configuration json file.`);
                }
                if (obj.operation) {
                    if (!obj.operation.operation || !obj.operation.operationSetting) {
                        throw new Error("invalid operation state");
                    }
                    const token = obj.token || Storage.get("token");
                    if (!token) {
                        throw new Error(`You need to signin or set --token param.`);
                    }
                    await operation_setting_1.OperationSetting.updateStatus(token, ((_a = obj.operation.operationSetting.node) === null || _a === void 0 ? void 0 : _a.id) || "");
                }
                const userconf = obj.configs.config;
                // menu mode and json flashing enabled device.
                await serial.setAllFromMenu(userconf);
                if (obj.operation) {
                    if (!obj.operation.operation || !obj.operation.operationSetting) {
                        throw new Error("invalid operation state");
                    }
                    const token = obj.token || Storage.get("token");
                    if (!token) {
                        throw new Error(`You need to signin or set --token param.`);
                    }
                    await operation_result_1.OperationResult.createWriteSuccess(token, ((_b = obj.operation.operationSetting.node) === null || _b === void 0 ? void 0 : _b.id) || "", info.obnizid);
                }
            }
            else {
                if (!("networks" in obj.configs.config)) {
                    throw new Error(`please provide "networks". see more detail at example json file`);
                }
                if (obj.operation) {
                    throw new Error(`Cannot use operation on obnizOS ver < 3.5.0`);
                }
                const userconf = obj.configs.config;
                // virtual UI.
                const networks = userconf.networks;
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
    spinner = ora(text).start();
    if (debugserial) {
        spinner.stop();
    }
    return spinner;
}
//# sourceMappingURL=index.js.map