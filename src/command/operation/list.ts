import chalk from "chalk";
import fs from "fs";
import path from "path";
import Defaults from "../../defaults";
import Device from "../../libs/obnizio/device";
import { Operation } from "../../libs/obnizio/operation";
import User from "../../libs/obnizio/user";
import Config from "../../libs/os/configure";
import PreparePort from "../../libs/os/serial/prepare";
import * as Storage from "../../libs/storage";

export const OperationListCommand =  {
  help: `Show your operation list
      --token       Token of api key which use instead of user signin.
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

    const operations = await Operation.getList(token);

    operations.map((op) => {
      console.log(` - ${op?.node?.name} (${op?.facilityName})`);
    });
  },
};
