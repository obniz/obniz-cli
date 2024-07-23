import chalk from "chalk";
import { DefaultParams } from "../../defaults.js";
import OS from "../../libs/obnizio/os.js";
import { flash } from "../../libs/os/flash.js";
import { validate as validateConfig } from "../../libs/os/config.js";
import { PreparePort } from "../../libs/os/serial/prepare.js";

import { getOra } from "../../libs/ora-console/getora.js";
import { ConfigCommand } from "./config.js";
import { Command } from "../arg.js";
const ora = getOra();

export const FlashCommand: Command = {
  help: `Flash obnizOS and configure it

[serial setting]
 -p --port      serial port path to flash.If not specified, the port list will be displayed.
 -b --baud      flashing baud rate. default to ${DefaultParams.BAUD}

[flashing setting]
 -h --hardware  hardware to be flashed. default to ${DefaultParams.HARDWARE}
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
  async execute(args: any, proceed?: (i: number) => void) {
    // validate first

    if (proceed) {
      proceed(1);
    }
    await validateConfig(args);

    if (proceed) {
      proceed(2);
    }
    // flashing os
    const obj = await PreparePort(args);

    if (proceed) {
      proceed(3);
    }

    const spinner = ora("obnizOS:").start();
    // OS setting
    let hardware: any = args.h || args.hardware;
    if (!hardware) {
      hardware = DefaultParams.HARDWARE;
    }
    let version: any = args.v || args.version;
    if (!version) {
      spinner.text = `obnizOS: Connecting obnizCloud to Public Latest Version of hardware=${chalk.green(hardware)}`;
      version = await OS.latestPublic(hardware);
      spinner.succeed(
        `obnizOS: [using default] hardware=${chalk.green(hardware)} version=${chalk.green(
          `${version}(Public Latest Version)`,
        )}`,
      );
    } else {
      spinner.succeed(
        `obnizOS: decided hardware=${chalk.green(hardware)} version=${chalk.green(version)}`,
      );
    }

    if (proceed) {
      proceed(4);
    }

    const os = {
      hardware,
      version,
    };
    await flash(obj, os);

    if (proceed) {
      proceed(5);
    }
    // Configure it
    args.p = undefined;
    args.port = obj.portname; // 万が一この期間にシリアルポートが新たに追加されるとずれる可能性があるので
    await ConfigCommand.execute(args);
  },
};
