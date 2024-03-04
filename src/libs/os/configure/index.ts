import chalk from "chalk";
import semver from "semver";
import { PromiseType } from "utility-types";
import { Operation } from "../../obnizio/operation";
import { OperationResult } from "../../obnizio/operation_result";
import { OperationSetting } from "../../obnizio/operation_setting";
import * as Storage from "../../storage";
import Serial from "../serial";

import { Ora } from "ora";
import { getOra } from "../../ora-console/getora";
const ora = getOra();

export interface ConfigParam {
  token: string;
  portname: string;
  debugserial?: boolean;
  stdout: (text: string) => void;
  configs: { devicekey: string; config: NetworkConfig | NetworkConfigBefore3_5_0 };
  via: string;
  operation?: {
    operation?: PromiseType<ReturnType<typeof Operation.getByOperationName>>;
    operationSetting?: PromiseType<ReturnType<typeof OperationSetting.getByIndication>>;
  };
}

export type NetworkType = "wirelesslan" | "wifimesh" | "wiredlan" | "cellularmodule";

export interface NetworkConfig {
  net: NetworkType;
  wifi?: any;
  wifimesh?: any;
  ether?: any;
  cellular?: any;
  passkey?: string;
  wifi_channel?: string;
}

export interface NetworkConfigBefore3_5_0 {
  networks: Array<{
    type: "wifi" | "ethernet" | "cellular";
    settings: {
      ssid?: string;
      password?: string;
      meshid?: string;

      hidden?: boolean;
      dhcp?: boolean;
      static_ip?: string;
      subnetmask?: string;
      dns?: string;
      proxy?: boolean;
      proxy_address?: string;
      proxy_port?: number;
    };
  }>;
}

export default async (obj: ConfigParam) => {
  // Return if no configs required
  if (!obj.configs) {
    return;
  }

  const serial = new Serial({
    portname: obj.portname,
    stdout: (text: string) => {
      if (obj.debugserial) {
        console.log(text);
      }
      received += text;
      obj.stdout(text);
    },
    onerror: (err: string) => {
      received += err;
      console.log(serial.totalReceived);
      throw new Error(`${err}`);
    },
    progress: (text: string, option: any = {}) => {
      if (obj.debugserial) {
        console.log(text);

        return;
      }
      if (option.keep) {
        spinner.text = text;
      } else {
        spinner = nextSpinner(spinner, `Configure: ${text}`, obj.debugserial);
      }
    },
  });
  let received = "";
  let spinner = ora(`Configure: Opening Serial Port ${chalk.green(obj.portname)}`).start();
  if (obj.debugserial) {
    spinner.stop();
  }
  try {
    await serial.open();

    // config devicekey
    if (obj.configs.devicekey) {
      await serial.setDeviceKey(obj.configs.devicekey);
    }

    // config network
    if (obj.configs.config) {
      // JSON provided by user

      // detect Target obnizOS
      const info = await serial.detectedObnizOSVersion();
      spinner.succeed(
        `Configure: Detect Target obnizOS. version=${chalk.green(info.version)} ${chalk.green(info.obnizid)}`,
      );

      if (semver.satisfies(info.version, ">=3.5.0")) {
        if ("networks" in obj.configs.config) {
          throw new Error(`You can't use older version of network configuration json file.`);
        }

        if (obj.operation) {
          if (!obj.operation.operation || !obj.operation.operationSetting) {
            throw new Error("invalid operation state");
          }
          const token = obj.token || Storage.get("token");
          if (!token) {
            throw new Error(`You need to signin or set --token param.`);
          }
          await OperationSetting.updateStatus(token, obj.operation.operationSetting.node?.id || "");
        }
        const userconf = obj.configs.config as NetworkConfig;
        // menu mode and json flashing enabled device.
        await serial.setAllFromMenu(userconf);

        if (obj.operation) {
          if (!obj.operation.operation || !obj.operation.operationSetting) {
            throw new Error("invalid operation state");
          }
          const token = obj.token || Storage.get("token");
          if (!token) {
            throw new Error(`You need to signin or set --token param.`);
          }
          await OperationResult.createWriteSuccess(token, obj.operation.operationSetting.node?.id || "", info.obnizid);
        }
      } else {
        if (!("networks" in obj.configs.config)) {
          throw new Error(`please provide "networks". see more detail at example json file`);
        }
        if (obj.operation) {
          throw new Error(`Cannot use operation on obnizOS ver < 3.5.0`);
        }

        const userconf = obj.configs.config as NetworkConfigBefore3_5_0;
        // virtual UI.
        const networks = userconf.networks;
        if (!Array.isArray(networks)) {
          throw new Error(`"networks" must be an array`);
        }
        if (networks.length !== 1) {
          throw new Error(`"networks" must have single object in array.`);
        }
        const network = networks[0];
        const type = network.type;
        const settings = network.settings;
        await serial.setNetworkType(type);
        if (type === "wifi") {
          await serial.setWiFi(settings);
        } else {
          spinner.fail(`Configure: Not Supported Network Type ${type}`);
          throw new Error(`obniz-cli not supporting settings for ${type} right now. wait for future release`);
        }
      }
    }
    await serial.close();
  } catch (e) {
    console.log(received);
    spinner.fail(`Configure: Failed ${e}`);
    throw e;
  }

  spinner.succeed(`Configure: Success`);
};

function nextSpinner(spinner: Ora, text: string, debugserial: any) {
  spinner.succeed();
  spinner = ora(text).start();
  if (debugserial) {
    spinner.stop();
  }
  return spinner;
}
