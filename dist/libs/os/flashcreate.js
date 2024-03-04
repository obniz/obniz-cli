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
const { URL } = require("url");
const chalk_1 = __importDefault(require("chalk"));
const defaults_1 = __importDefault(require("../../defaults"));
const os_1 = __importDefault(require("../../libs/obnizio/os"));
const device_1 = __importDefault(require("../obnizio/device"));
const Storage = __importStar(require("../storage"));
const _flash_1 = __importDefault(require("./_flash"));
const config_1 = __importStar(require("./config"));
const prepare_1 = __importDefault(require("./serial/prepare"));
const inquirer_1 = __importDefault(require("inquirer"));
const getora_1 = require("../ora-console/getora");
const ora = getora_1.getOra();
exports.default = {
    help: `Flash obnizOS and configure it

[serial setting]
 -p --port        serial port path to flash.If not specified, the port list will be displayed.
 -b --baud        flashing baud rate. default to ${defaults_1.default.BAUD}

[flashing setting]
 -h --hardware    hardware to be flashed. default to ${defaults_1.default.HARDWARE}
 -v --version     obnizOS version to be flashed. default to latest one.

[obnizCloud device setting]
 -r --region      device config region
    --description device config description
 -c --config      configuration file path. If specified obniz-cli proceed settings following file like setting wifi SSID/Password.
    --token     Token of api key which use instead of user signin.

[operation]
    --operation     operation name for setting.
    --indication    indication name for setting.
  `,
    async execute(args, proceed) {
        // If device related configration exist
        // It is not allowed. because device will be created from me.
        if (args.d || args.devicekey || args.i || args.id) {
            throw new Error(`You can't pass devicekey/id arguments. Because flash-create will create new device.`);
        }
        // login check
        const token = args.token || Storage.get("token");
        if (!token) {
            throw new Error(`You must singin before create device`);
        }
        if (proceed) {
            proceed(1);
        }
        // validate first
        await config_1.validate(args);
        if (proceed) {
            proceed(2);
        }
        // SerialPortSetting
        const obj = await prepare_1.default(args);
        obj.stdout = (text) => {
            // process.stdout.write(text);
        };
        if (proceed) {
            proceed(3);
        }
        let device;
        if (args.obniz_id) {
            // recovery without asking when existing obniz id specified
            device = await device_1.default.get(token, args.obniz_id);
        }
        else if (!args.skiprecovery) {
            // recovery data.
            const recoveryDeviceString = Storage.get("recovery-device");
            if (recoveryDeviceString) {
                const readedDevice = JSON.parse(recoveryDeviceString);
                const use = await askUseRecovery(readedDevice);
                if (use) {
                    device = readedDevice;
                }
                else {
                    Storage.set("recovery-device", null);
                }
            }
        }
        let qrData = null;
        // IF manufacturer
        if (args.bindtoken) {
            qrData = await askSerialToken(device, args.serial_token);
        }
        // No more asking
        let hardware;
        let version;
        let spinner;
        spinner = ora("obnizOS:").start();
        // hardware
        hardware = args.h || args.hardware || defaults_1.default.HARDWARE;
        obj.hardware = hardware;
        // version
        version = args.v || args.version;
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
        if (device) {
            spinner = ora("obnizCloud:").start();
            spinner.succeed(`obnizCloud: using recovery device obnizID=${chalk_1.default.green(device.id)} description=${chalk_1.default.green(device.description)} region=${chalk_1.default.green(device.region)}`);
        }
        else {
            spinner = ora("obnizCloud: creating device on obnizCloud...").start();
            try {
                // Device Creation Setting
                const region = args.r || args.region || "jp";
                const description = args.description || "";
                // registrate
                const requestObj = {
                    region,
                    description,
                    hardware,
                };
                if (qrData) {
                    requestObj.serialdata = `${qrData.serialcode}/${qrData.token}`;
                }
                device = await device_1.default.create(token, requestObj);
                Storage.set("recovery-device", JSON.stringify(device));
                spinner.succeed(`obnizCloud: created device on obnizCloud obnizID=${chalk_1.default.green(device.id)} description=${chalk_1.default.green(device.description)} region=${chalk_1.default.green(device.region)}`);
            }
            catch (e) {
                spinner.fail(`obnizCloud: ${e}`);
                throw e;
            }
        }
        try {
            // Configure it
            args.p = undefined;
            args.port = obj.portname; // 万が一この期間にシリアルポートが新たに追加されるとずれる可能性があるので
            args.devicekey = device.devicekey;
            await config_1.default.execute(args, proceed);
            Storage.set("recovery-device", null);
        }
        catch (e) {
            chalk_1.default.yellow(`obnizID ${device.id} device key and information was sotred in recovery file`);
            throw e;
        }
    },
};
async function askUseRecovery(device) {
    const answer = await inquirer_1.default.prompt([
        {
            type: "list",
            name: "yesno",
            message: `Would you like to use recovery device ${device.id} [ ${device.description} ] rather than create one more device? It was failed one last time.`,
            choices: [
                {
                    name: `Yes. I'm going to use recovery.`,
                    value: `yes`,
                },
                {
                    name: `No. Discard it and create new obnizID on obnizCloud`,
                    value: `no`,
                },
            ],
            default: "yes",
        },
    ]);
    return answer.yesno === "yes";
}
async function askSerialToken(device, serial_token) {
    let answer;
    if (serial_token) {
        answer = { serialtoken: serial_token };
    }
    else {
        answer = await inquirer_1.default.prompt([
            {
                type: "input",
                name: "serialtoken",
                message: `Scan QR Code. Waiting...`,
            },
        ]);
    }
    const spinner = ora("Serial: Binding...").start();
    try {
        const url = new URL(answer.serialtoken);
        const paths = url.pathname.split("/");
        if (paths.length !== 4 || paths[1] !== "sn") {
            throw new Error(`Invalid Serial Code`);
        }
        const serialcode = paths[2];
        const token = paths[3];
        spinner.succeed(`Serial: SerialCode=${chalk_1.default.green(serialcode)} Token=${chalk_1.default.green(token)}`);
        return {
            serialcode,
            token,
        };
    }
    catch (e) {
        spinner.fail(`Invalid SerialCode`);
        throw e;
    }
}
//# sourceMappingURL=flashcreate.js.map