import { DefaultParams } from "../../defaults.js";
import { PreparePort } from "../common/prepare_port.js";
import {
  DeviceAndNetworkConfig,
  execConfig,
  OnlyDeviceConfig,
  OnlyNetworkConfig,
} from "../../libs/os/configure/index.js";
import { Command } from "../arg.js";
import { PrepareDevicekey } from "../common/prepare_devicekey.js";
import { PrepareConfigFromFile } from "../common/prepare_config_from_file.js";
import { PrepareConfigFromOperation } from "../common/prepare_config_from_operation.js";
import { OperationResult } from "../../libs/obnizio/operation_result.js";
import { OperationSetting } from "../../libs/obnizio/operation_setting.js";

export interface ConfigCommandArgs {
  p?: string;
  port?: string;
  b?: string;
  baud?: string;
  d?: string;
  devicekey?: string;
  i?: string;
  id?: string;
  c?: string;
  config?: string;
  token?: string;
  operation?: string;
  indication?: string;
}

export const ConfigCommand = {
  help: `Flash obnizOS and configure it

[serial setting]
 -p --port        serial port path to flash.If not specified, the port list will be displayed.
 -b --baud        flashing baud rate. default to ${DefaultParams.BAUD}

 [configurations]
 -d --devicekey     devicekey to be configured after flash. please quote it like "00000000&abcdefghijklkm"
 -i --id            obnizID to be configured. You need to signin before use this or set --token param.
 -c --config        configuration file path. If specified obniz-cli proceed settings following file like setting wifi SSID/Password.
    --token         Token of api key which use instead of user signin.

 [operation]
    --operation     operation name for setting.
    --indication    indication name for setting.
  `,
  async execute(args: ConfigCommandArgs) {
    // Serial Port Setting
    const port = await PreparePort(args);
    const deviceConfig = await PrepareDevicekey(args);
    const networkConfigFromFile = await PrepareConfigFromFile(args);
    const networkConfigFromOperation = await PrepareConfigFromOperation(args);
    if (networkConfigFromFile && networkConfigFromOperation) {
      throw new Error(
        `You can't use both config file and operation setting at the same time.`,
      );
    }
    const networkConfig =
      networkConfigFromFile?.config ||
      networkConfigFromOperation?.config ||
      null;

    const deviceOrNetworkConfig = { deviceConfig, networkConfig };
    if (
      !deviceOrNetworkConfig.deviceConfig &&
      !deviceOrNetworkConfig.networkConfig
    ) {
      // no configuration provided
      console.log(`No configuration found. Finished.`);
      return;
    }

    if (networkConfigFromOperation) {
      await OperationSetting.updateStatus(
        networkConfigFromOperation.token,
        networkConfigFromOperation.operation.operationSetting?.node?.id || "",
      );
    }

    const info = await execConfig(
      deviceOrNetworkConfig as
        | DeviceAndNetworkConfig
        | OnlyDeviceConfig
        | OnlyNetworkConfig,
      port,
      !!networkConfigFromOperation,
    );

    if (info && networkConfigFromOperation) {
      await OperationResult.createWriteSuccess(
        networkConfigFromOperation.token,
        networkConfigFromOperation.operation.operationSetting?.node?.id || "",
        info.obnizId,
      );
    }
  },
} as const satisfies Command;
