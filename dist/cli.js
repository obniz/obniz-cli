#!/usr/bin/env node
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
const arg_1 = __importDefault(require("./arg"));
const gui = __importStar(require("./gui"));
const ports_1 = __importDefault(require("./libs/os/ports"));
const config_1 = __importDefault(require("./libs/os/config"));
const config_via_wifi_1 = __importDefault(require("./libs/os/config_via_wifi"));
const erase_1 = __importDefault(require("./libs/os/erase"));
const flash_1 = __importDefault(require("./libs/os/flash"));
const flashcreate_1 = __importDefault(require("./libs/os/flashcreate"));
const list_1 = __importDefault(require("./libs/os/list"));
const prepare_1 = __importDefault(require("./libs/os/serial/prepare"));
const info_1 = __importDefault(require("./libs/user/info"));
const login_1 = __importDefault(require("./libs/user/login"));
const logout_1 = __importDefault(require("./libs/user/logout"));
const info_2 = __importDefault(require("./libs/operation/info"));
const list_2 = __importDefault(require("./libs/operation/list"));
const packageverion = require(`../package.json`).version;
// ========== Global Errors =========
process.on("uncaughtException", (err) => {
    console.error(err);
    throw err;
});
process.on("unhandledRejection", (err) => {
    console.error(err);
    throw err;
});
// ========== Routes =========
const routes = {
    "signin": {
        help: `Signin to obniz Cloud`,
        async execute(args) {
            await login_1.default();
        },
    },
    "signout": {
        help: `Signout`,
        async execute(args) {
            await logout_1.default();
        },
    },
    "user:info": {
        help: `Get Currently signin user's information from cloud`,
        async execute(args) {
            await info_1.default();
        },
    },
    "os:flash-create": flashcreate_1.default,
    "os:flash": flash_1.default,
    "os:config": config_1.default,
    "os:config-via-wifi": config_via_wifi_1.default,
    "os:erase": {
        async execute(args) {
            const obj = await prepare_1.default(args);
            obj.stdout = (text) => {
                process.stdout.write(text);
            };
            await erase_1.default(obj);
        },
    },
    "os:list": list_1.default,
    "os:ports": {
        help: `List your machine's serial ports`,
        async execute(args) {
            await ports_1.default();
        },
    },
    "operation:list": list_2.default,
    "operation:info": info_2.default,
    "gui": {
        async execute(args) {
            console.log(`Launching...`);
            try {
                await gui.start();
            }
            catch (e) {
                console.error(`Failed to Launch GUI`);
                console.error(e);
                process.exit(1);
            }
        },
    },
    "help": async () => {
        console.log(`
       _           _               _ _
  ___ | |__  _ __ (_)____      ___| (_)
 / _ \\| '_ \\| '_ \\| |_  /____ / __| | |
| (_) | |_) | | | | |/ /_____| (__| | |
 \\___/|_.__/|_| |_|_/___|     \\___|_|_|


CLI to interact with obniz device and cloud.

VERSION
  obniz-cli/${packageverion}

USAGE
  $ obniz-cli [COMMAND]

COMMANDS

  signin              Signin to obniz cloud.
  signout             Signout

  user:info           Show current Logged in user

  os:flash-create     Flashing and configure target device and registrate it on your account on obnizCloud.
  os:flash            Flashing and configure target device.
  os:config           Configure obnizOS flashed device.
  os:config-via-wifi  Configure ObnizOS network via Wi-Fi from devices.
  os:erase            Fully erase a flash on target device.
  os:list             List of available obnizOS hardwares and versions
  os:ports            Getting serial ports on your machine.

  operation:list      List of available operations.
  operation:info      Show operation info.
  `);
    },
};
arg_1.default(routes)
    .then(() => {
    // wtf.dump();
})
    .catch((e) => {
    console.log(chalk_1.default.red(`${e}`));
    process.exit(1);
});
//# sourceMappingURL=cli.js.map