import * as readline from "readline";

import SerialPort from "serialport";
import Defaults from "../../../defaults";
import SerialGuess from "./guess";

import chalk from "chalk";
import inquirer from "inquirer";
import { getOra } from "../../ora-console/getora";
const ora = getOra();

export default async (args: any): Promise<any> => {
  let portname: string | undefined = args.p || args.port;
  if (!portname) {
    console.log(chalk.yellow(`No serial port specified.`));
  }

  const autoChoose = portname === "AUTO";
  if (autoChoose) {
    portname = undefined;
  }

  // display port list
  const ports: SerialPort.PortInfo[] = await SerialPort.list();
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
      console.log(chalk.red(`specified serial port ${portname} was not found.`));
      portname = undefined;
    }
  }

  // not specified or not found
  if (!portname) {
    const guessed_portname = (await SerialGuess()).portname;
    if (autoChoose) {
      portname = guessed_portname;
    }

    if (!portname) {
      const selected = await selectPort(ports, guessed_portname);
      portname = selected;
    }
  }

  let baud: any = args.b || args.baud;
  if (!baud) {
    baud = Defaults.BAUD;
  }

  const debugserial: any = args.debugserial;

  const spinner = ora("Serial Port:").start();
  spinner.succeed(`Serial Port: decided ${chalk.green(portname)} baudrate ${baud}`);

  return {
    portname,
    baud,
    debugserial,
  };
};

async function selectPort(ports: SerialPort.PortInfo[], defaultValue: any): Promise<string> {
  const portNames = [];
  for (let i = 0; i < ports.length; i++) {
    const port = ports[i];
    portNames.push({
      name: `${port.path}${port.manufacturer ? ` (${port.manufacturer})` : ``}`,
      value: port.path,
    });
  }

  const answer = await inquirer.prompt([
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
