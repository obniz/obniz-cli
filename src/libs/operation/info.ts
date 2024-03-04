import chalk from "chalk";
import fs from "fs";
import path from "path";
import Defaults from "../../defaults";
import Device from "../obnizio/device";
import { Operation } from "../obnizio/operation";
import { OperationSetting } from "../obnizio/operation_setting";
import Config from "../os/configure";
import PreparePort from "../os/serial/prepare";
import * as Storage from "../storage";

export default {
  help: `Show the operation info
   -o --operation   operationId to be show
      --token       Token of api key which use instead of user signin.
  \`,
  `,
  async execute(args: any) {
    const token = args.token || Storage.get("token");
    if (!token) {
      console.log(`Not Sign In`);
      return;
    }
    if (!(await Operation.checkPermission(token))) {
      console.log(`You don't have Facility permission. Please 'obniz-cli signin' again`);
      return;
    }

    console.log(`Contacting to obniz Cloud...`);
    const operationName = args.o || args.operation || "";

    const operations = await Operation.getList(token);
    const targetOperation = operations.find((o) => o?.node?.name === operationName);
    if (!targetOperation) {
      console.log(`Not found operation "${operationName}" `);
      return;
    }

    const operationSettings = await OperationSetting.getList(token, targetOperation?.node?.id || "");

    const status = {
      0: "Todo",
      1: "Work in progress",
      2: "Finished",
    };

    operationSettings.map((op) => {
      console.log(` - ${op?.node?.indicationId} (${status[(op?.node?.status as any) as keyof typeof status]})`);
    });
  },
};
