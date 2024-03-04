"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const wifi_1 = __importDefault(require("./wifi"));
exports.default = {
    help: `Configure ObnizOS network via Wi-Fi from devices.

 [configurations]
 -c --config      configuration file path. If specified obniz-cli proceed settings following file like setting wifi SSID/Password.
  `,
    execute(args, signal) {
        return new Promise(async (resolve, reject) => {
            let configs;
            // Network Setting
            const configPath = args.c || args.config;
            if (configPath) {
                const filepath = path_1.default.isAbsolute(configPath) ? configPath : path_1.default.join(process.cwd(), configPath);
                if (!fs_1.default.existsSync(filepath)) {
                    throw new Error(`config file ${filepath} does not exist!!`);
                }
                const jsonString = fs_1.default.readFileSync(filepath, { encoding: "utf8" });
                let json = null;
                try {
                    json = JSON.parse(jsonString);
                }
                catch (e) {
                    console.error(`Can't read config file as json`);
                    throw e;
                }
                configs = json;
            }
            if (!configs) {
                // no configuration provided
                console.log(chalk_1.default.red(`No configration found. exit.`));
                return;
            }
            const duplicate = !(args.duplicate === "false");
            signal === null || signal === void 0 ? void 0 : signal.addEventListener("abort", () => {
                console.log("Aborted.");
                resolve();
            });
            // Init Wi-Fi
            const wifi = new wifi_1.default({
                stdout: (text) => {
                    process.stdout.write(text);
                },
                onerror: (err) => {
                    throw new Error(`${err}`);
                },
            });
            await wifi.setNetwork(configs, duplicate, signal);
        });
    },
};
//# sourceMappingURL=config_via_wifi.js.map