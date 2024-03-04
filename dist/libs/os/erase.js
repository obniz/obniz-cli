"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
exports.default = (obj) => {
    return new Promise((resolve, reject) => {
        var _a, _b, _c;
        let received = "";
        let success = false;
        obj.stdout("", { clear: true });
        const cmd = `esptool.py --chip esp32 --port ${obj.portname} --baud ${obj.baud} erase_flash`;
        console.log(cmd);
        const child = child_process_1.default.exec(cmd);
        (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.setEncoding("utf8");
        (_b = child.stdout) === null || _b === void 0 ? void 0 : _b.on("data", (text) => {
            obj.stdout(text);
            received += text;
            if (received.indexOf("Chip erase completed successfully") >= 0) {
                // 終わったっぽい
                success = true;
            }
        });
        (_c = child.stderr) === null || _c === void 0 ? void 0 : _c.on("data", (text) => {
            obj.stdout(text);
            received += text;
        });
        child.on("error", (err) => {
            reject(err);
        });
        child.on("exit", () => {
            resolve(success);
        });
    });
};
//# sourceMappingURL=erase.js.map