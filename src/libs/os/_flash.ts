import { EspLoader } from "@9wick/esptool.js";
import { EsptoolSerial } from "@9wick/esptool.js/build/node/serial";
import { sleep } from "@9wick/esptool.js/build/util";
import chalk from "chalk";
import child_process from "child_process";
import { promises as fs } from "fs";

import { getOra } from "../ora-console/getora";
const ora = getOra();

import OS from "../obnizio/os";

export default function flash(obj: {
  portname: string;
  hardware: string;
  version: string;
  baud: number;
  debugserial: any;
  stdout: any;
}) {
  return new Promise(async (resolve, reject) => {
    let status = "connecting";

    const spinner = ora(
      `Flashing obnizOS: preparing file for hardware=${chalk.green(obj.hardware)} version=${chalk.green(obj.version)}`,
    ).start();
    if (obj.debugserial) {
      spinner.stop();
    }

    // prepare files
    const files = await OS.prepareLocalFile(obj.hardware, obj.version, (progress: string) => {
      spinner.text = `Flashing obnizOS: ${progress}`;
    });

    let received = "";

    const cmd =
      `esptool.py --chip auto --port "${obj.portname}" --baud ${obj.baud} --before default_reset --after hard_reset` +
      ` write_flash` +
      ` -z --flash_mode dio --flash_freq 40m --flash_size detect` +
      ` 0x1000 "${files.bootloader_path}"` +
      ` 0x10000 "${files.app_path}"` +
      ` 0x8000 "${files.partition_path}"`;

    const onSuccess = () => {
      spinner.succeed(`Flashing obnizOS: Flashed`);
      resolve();
    };
    const onFailed = (err: any) => {
      spinner.fail(`Flashing obnizOS: Fail`);
      reject(err);
    };

    spinner.text = `Flashing obnizOS: Opening Serial Port ${chalk.green(obj.portname)}`;

    const child = child_process.exec(cmd);
    child.stdout?.setEncoding("utf8");
    child.stdout?.on("data", (text) => {
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
    child.stderr?.on("data", (text) => {
      if (obj.debugserial) {
        obj.stdout(text);
      }
      received += `${chalk.red(text)}`;
    });
    child.on("error", (er) => {
      onFailed(er);
    });
    child.on("exit", (code) => {
      try {
        throwIfFailed(received);
      } catch (e) {
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

function throwIfFailed(text: string) {
  if (text.indexOf("Leaving...") >= 0) {
    // success
    return;
  }
  let err;
  if (text.indexOf("Timed out waiting for packet header") >= 0) {
    err = new Error(`No Bootload mode ESP32 found. Check connection or Boot Mode.`);
  } else {
    err = new Error(`Failed Flashing.`);
  }
  console.log(text);
  throw err;
}
