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
const defaults_1 = __importDefault(require("../../defaults"));
const os_1 = __importDefault(require("../../libs/obnizio/os"));
const _flash_1 = __importDefault(require("./_flash"));
const config_1 = __importStar(require("./config"));
const prepare_1 = __importDefault(require("./serial/prepare"));
const getora_1 = require("../ora-console/getora");
const ora = getora_1.getOra();
exports.default = {
    help: `Flash obnizOS and configure it

[serial setting]
 -p --port      serial port path to flash.If not specified, the port list will be displayed.
 -b --baud      flashing baud rate. default to ${defaults_1.default.BAUD}

[flashing setting]
 -h --hardware  hardware to be flashed. default to ${defaults_1.default.HARDWARE}
 -v --version   obnizOS version to be flashed. default to latest one.

[configurations]
 -d --devicekey devicekey to be configured after flash. please quote it like "00000000&abcdefghijklkm"
 -i --id        obnizID to be configured. You need to signin before use this or set --token param.
 -c --config    configuration file path. If specified obniz-cli proceed settings following file like setting wifi SSID/Password.
    --token     Token of api key which use instead of user signin.

[operation]
    --operation     operation name for setting.
    --indication    indication name for setting.
      `,
    async execute(args, proceed) {
        // validate first
        if (proceed) {
            proceed(1);
        }
        await config_1.validate(args);
        if (proceed) {
            proceed(2);
        }
        // flashing os
        const obj = await prepare_1.default(args);
        obj.stdout = (text) => {
            process.stdout.write(text);
        };
        if (proceed) {
            proceed(3);
        }
        const spinner = ora("obnizOS:").start();
        // OS setting
        let hardware = args.h || args.hardware;
        if (!hardware) {
            hardware = defaults_1.default.HARDWARE;
        }
        obj.hardware = hardware;
        let version = args.v || args.version;
        if (!version) {
            spinner.text = `obnizOS: Connecting obnizCloud to Public Latest Version of hardware=${chalk_1.default.green(hardware)}`;
            version = await os_1.default.latestPublic(hardware);
            spinner.succeed(`obnizOS: [using default] hardware=${chalk_1.default.green(hardware)} version=${chalk_1.default.green(`${version}(Public Latest Version)`)}`);
        }
        else {
            spinner.succeed(`obnizOS: decided hardware=${chalk_1.default.green(hardware)} version=${chalk_1.default.green(version)}`);
        }
        obj.version = version;
        if (proceed) {
            proceed(4);
        }
        await _flash_1.default(obj);
        if (proceed) {
            proceed(5);
        }
        // Configure it
        args.p = undefined;
        args.port = obj.portname; // 万が一この期間にシリアルポートが新たに追加されるとずれる可能性があるので
        await config_1.default.execute(args);
    },
};
//# sourceMappingURL=flash.js.map