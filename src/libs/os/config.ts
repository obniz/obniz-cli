import chalk from "chalk";
import fs from "fs";
import path from "path";
import { DeepPartial } from "utility-types";
import Device from "../obnizio/device.js";
import { Operation } from "../obnizio/operation.js";
import { OperationSetting } from "../obnizio/operation_setting.js";
import * as Storage from "../storage.js";
import Config, { ConfigParam } from "./configure/index.js";
import { getOra } from "../ora-console/getora.js";
const ora = getOra();

export async function deviceConfigValidate(
  args: Readonly<any>,
  obj: DeepPartial<ConfigParam> = {},
  logging = false,
) {
  const devicekey: any = args.d || args.devicekey;
  let obniz_id: any = null;
  if (devicekey) {
    obj.configs = obj.configs || {};
    obj.configs.devicekey = devicekey;
    obniz_id = devicekey.split("&")[0];
  }
  if (args.i || args.id) {
    const spinner = logging
      ? ora(
          `Configure: Opening Serial Port ${chalk.green(obj.portname)}`,
        ).start()
      : null;
    try {
      obniz_id = args.i || args.id;
      if (obj.configs && obj.configs.devicekey) {
        throw new Error(`devicekey and id are double specified.`);
      }
      const token = args.token || Storage.get("token");
      if (!token) {
        throw new Error(`You need to signin or set --token param`);
      }
      if (!(await Device.checkReadPermission(token))) {
        throw new Error(`Your token is not permitted to be read the device`);
      }
      const device = await Device.get(token, obniz_id);
      if (!device) {
        throw new Error(`device ${obniz_id} was not found in your devices.`);
      }
      if (!device.devicekey) {
        throw new Error(`device ${obniz_id} has no devicekey.`);
      }
      obj.configs = obj.configs || {};
      obj.configs.devicekey = device.devicekey;
      spinner?.succeed(
        `Configure: obnizID=${device.id} hardware=${device.hardware} devicekey=${device.devicekey}`,
      );
    } catch (e) {
      spinner?.fail(`Configure: Failed ${e}`);
      throw e;
    }
  }
}

export async function networkConfigValidate(
  args: Readonly<any>,
  obj: DeepPartial<ConfigParam> = {},
  logging = false,
) {
  // Network Setting
  const configPath: string | null = args.c || args.config || null;
  const operationName: string | null = args.operation || null;
  const indicationName: string | null = args.indication || null;
  if (operationName && !indicationName) {
    throw new Error(
      "If you want to use operation, set both param of operation and indication.",
    );
  } else if (!operationName && indicationName) {
    throw new Error(
      "If you want to use operation, set both param of operation and indication.",
    );
  } else if (configPath && operationName && indicationName) {
    throw new Error("You cannot use configPath and operation same time.");
  } else if (configPath) {
    const filepath = path.isAbsolute(configPath)
      ? configPath
      : path.join(process.cwd(), configPath);
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
    obj.configs = obj.configs || {};
    obj.configs.config = json;
  } else if (operationName && indicationName) {
    const spinner = logging
      ? ora(`Operation: getting information`).start()
      : null;
    try {
      const token = args.token || Storage.get("token");
      if (!token) {
        throw new Error(`You need to signin or set --token param`);
      }
      if (!(await Operation.checkPermission(token))) {
        throw new Error(
          `You dont have permission to use operation. Please run 'obniz-cli signin' or set --token param`,
        );
      }
      const op = await Operation.getByOperationName(token, operationName);
      if (!op || !op.node) {
        throw new Error(`Operation not found  '${operationName}'`);
      }

      Operation.checkCanWriteFromCli(op);
      const ops =
        indicationName === "next"
          ? await OperationSetting.getFirstTodoOrWipOne(token, op.node.id || "")
          : await OperationSetting.getByIndication(
              token,
              op.node.id || "",
              indicationName,
            );

      if (!ops || !ops.node) {
        if (indicationName === "next") {
          throw new Error(`Todo indication not found`);
        } else {
          throw new Error(`Indication not found  '${indicationName}'`);
        }
      }
      if (ops.node.status === 2) {
        throw new Error(`Indication already finished  '${indicationName}'`);
      }

      obj.configs = obj.configs || {};
      obj.configs.config = JSON.parse(ops.node.networkConfigs);
      obj.operation = {
        operation: op,
        operationSetting: ops,
      };
      spinner?.succeed(
        `Operation: Got information of name=${chalk.green(op.node.name)} indication=${chalk.green(
          ops.node.indicationId,
        )}`,
      );
    } catch (e) {
      spinner?.fail(`Operation: Failed ${e}`);
      throw e;
    }
  }
}

export async function validate(
  args: Readonly<any>,
  obj: DeepPartial<ConfigParam> = {},
  logging = false,
) {
  await deviceConfigValidate(args, obj, logging);
  await networkConfigValidate(args, obj, logging);
}
