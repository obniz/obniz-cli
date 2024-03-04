"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = __importDefault(require("child_process"));
const getora_1 = require("../ora-console/getora");
const ora = getora_1.getOra();
const os_1 = __importDefault(require("../obnizio/os"));
function flash(obj) {
    return new Promise(async (resolve, reject) => {
        var _a, _b, _c;
        let status = "connecting";
        const spinner = ora(`Flashing obnizOS: preparing file for hardware=${chalk_1.default.green(obj.hardware)} version=${chalk_1.default.green(obj.version)}`).start();
        if (obj.debugserial) {
            spinner.stop();
        }
        // prepare files
        const files = await os_1.default.prepareLocalFile(obj.hardware, obj.version, (progress) => {
            spinner.text = `Flashing obnizOS: ${progress}`;
        });
        let received = "";
        const cmd = `esptool.py --port "${obj.portname}" --baud ${obj.baud} --before default_reset --after hard_reset` +
            ` write_flash` +
            ` -z --flash_mode dio --flash_freq 40m --flash_size detect` +
            ` 0x1000 "${files.bootloader_path}"` +
            ` 0x10000 "${files.app_path}"` +
            ` 0x8000 "${files.partition_path}"`;
        const onSuccess = () => {
            spinner.succeed(`Flashing obnizOS: Flashed`);
            resolve();
        };
        const onFailed = (err) => {
            spinner.fail(`Flashing obnizOS: Fail`);
            reject(err);
        };
        spinner.text = `Flashing obnizOS: Opening Serial Port ${chalk_1.default.green(obj.portname)}`;
        const child = child_process_1.default.exec(cmd);
        (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.setEncoding("utf8");
        (_b = child.stdout) === null || _b === void 0 ? void 0 : _b.on("data", (text) => {
            // console.log(text);
            if (obj.debugserial) {
                console.log(text);
                obj.stdout(text);
            }
            received += text;
            if (status === "connecting" && received.indexOf(`Chip is`) >= 0) {
                status = "flashing";
                spinner.text = `Flashing obnizOS: Connected. Flashing...`;
            }
        });
        (_c = child.stderr) === null || _c === void 0 ? void 0 : _c.on("data", (text) => {
            if (obj.debugserial) {
                obj.stdout(text);
            }
            received += `${chalk_1.default.red(text)}`;
        });
        child.on("error", (er) => {
            onFailed(er);
        });
        child.on("exit", (code) => {
            try {
                throwIfFailed(received);
            }
            catch (e) {
                onFailed(e);
                return;
            }
            if (code !== 0) {
                reject(new Error(`Failed Flashing.`));
                return;
            }
            onSuccess();
        });
    });
}
exports.default = flash;
function throwIfFailed(text) {
    if (text.indexOf("Leaving...") >= 0) {
        // success
        return;
    }
    let err;
    if (text.indexOf("Timed out waiting for packet header") >= 0) {
        err = new Error(`No Bootload mode ESP32 found. Check connection or Boot Mode.`);
    }
    else {
        err = new Error(`Failed Flashing.`);
    }
    console.log(text);
    throw err;
}
//# sourceMappingURL=_flash.js.map