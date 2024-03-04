"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialport_1 = __importDefault(require("serialport"));
exports.default = async () => {
    let portname;
    const serialInfo = await findUsbSerials();
    const availablePorts = serialInfo.availablePorts;
    if (availablePorts.length === 0) {
        // not found
    }
    else if (availablePorts.length === 1) {
        portname = availablePorts[0];
    }
    else if (availablePorts.length > 1) {
        console.error("multiple usbserial found");
        for (let i = 0; i < availablePorts.length; i++) {
            console.log(" - " + availablePorts[i] + ` ${i === 0 ? "CHOOSED" : ""}`);
        }
        portname = availablePorts[0];
    }
    return { portname, ports: serialInfo.ports };
};
async function findUsbSerials() {
    const availablePorts = [];
    const ports = await serialport_1.default.list();
    for (const port of ports) {
        if (port.manufacturer && port.manufacturer.indexOf("M5STACK") >= 0) {
            availablePorts.push(port.path);
            break;
        }
        else if (port.path.indexOf("tty.SLAB") >= 0) {
            availablePorts.push(port.path);
            break;
        }
        else if (port.path.indexOf("ttyUSB") >= 0) {
            availablePorts.push(port.path);
            break;
        }
        else if (port.path.indexOf("usbserial") >= 0) {
            availablePorts.push(port.path);
            break;
        }
    }
    return { availablePorts, ports };
}
//# sourceMappingURL=guess.js.map