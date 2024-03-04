import chalk from "chalk";
import fs from "fs";
import path from "path";
import WiFi from "./wifi";

export default {
  help: `Configure ObnizOS network via Wi-Fi from devices.

 [configurations]
 -c --config      configuration file path. If specified obniz-cli proceed settings following file like setting wifi SSID/Password.
  `,
  execute(args: any, signal?: AbortSignal): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let configs: any;
      // Network Setting
      const configPath: any = args.c || args.config;
      if (configPath) {
        const filepath = path.isAbsolute(configPath) ? configPath : path.join(process.cwd(), configPath);
        if (!fs.existsSync(filepath)) {
          throw new Error(`config file ${filepath} does not exist!!`);
        }
        const jsonString = fs.readFileSync(filepath, { encoding: "utf8" });
        let json: any = null;
        try {
          json = JSON.parse(jsonString);
        } catch (e) {
          console.error(`Can't read config file as json`);
          throw e;
        }
        configs = json;
      }
      if (!configs) {
        // no configuration provided
        console.log(chalk.red(`No configration found. exit.`));
        return;
      }

      const duplicate: boolean = !(args.duplicate === "false");

      signal?.addEventListener("abort", () => {
        console.log("Aborted.");
        resolve();
      });

      // Init Wi-Fi
      const wifi = new WiFi({
        stdout: (text: string) => {
          process.stdout.write(text);
        },
        onerror: (err: any) => {
          throw new Error(`${err}`);
        },
      });
      await wifi.setNetwork(configs, duplicate, signal);
    });
  },
};
