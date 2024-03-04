"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialport_1 = __importDefault(require("serialport"));
const defaults_1 = __importDefault(require("../../../defaults"));
const guess_1 = __importDefault(require("./guess"));
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const getora_1 = require("../../ora-console/getora");
const ora = getora_1.getOra();
exports.default = async (args) => {
    let portname = args.p || args.port;
    if (!portname) {
        console.log(chalk_1.default.yellow(`No serial port specified.`));
    }
    const autoChoose = portname === "AUTO";
    if (autoChoose) {
        portname = undefined;
    }
    // display port list
    const ports = await serialport_1.default.list();
    // Specified. check ports
    if (portname) {
        let found = false;
        for (const port of ports) {
            if (port.path === portname) {
                found = true;
                break;
            }
        }
        if (!found) {
            console.log(chalk_1.default.red(`specified serial port ${portname} was not found.`));
            portname = undefined;
        }
    }
    // not specified or not found
    if (!portname) {
        const guessed_portname = (await guess_1.default()).portname;
        if (autoChoose) {
            portname = guessed_portname;
        }
        if (!portname) {
            const selected = await selectPort(ports, guessed_portname);
            portname = selected;
        }
    }
    let baud = args.b || args.baud;
    if (!baud) {
        baud = defaults_1.default.BAUD;
    }
    const debugserial = args.debugserial;
    const spinner = ora("Serial Port:").start();
    spinner.succeed(`Serial Port: decided ${chalk_1.default.green(portname)} baudrate ${baud}`);
    return {
        portname,
        baud,
        debugserial,
    };
};
async function selectPort(ports, defaultValue) {
    const portNames = [];
    for (let i = 0; i < ports.length; i++) {
        const port = ports[i];
        portNames.push({
            name: `${port.path}${port.manufacturer ? ` (${port.manufacturer})` : ``}`,
            value: port.path,
        });
    }
    const answer = await inquirer_1.default.prompt([
        {
            type: "list",
            name: "port",
            message: "Serial Ports available on your machine",
            choices: portNames,
            default: defaultValue,
        },
    ]);
    return answer.port;
}
//# sourceMappingURL=prepare.js.map