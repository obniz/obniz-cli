import child_process from "child_process";

import ESP from "./esptool";

export default async (obj: { portname: string; baud: number; stdout: any }) => {
  const esp = new ESP(obj.portname, obj.baud);
  // return new Promise((resolve, reject) => {
  //   let received = "";
  //   let success = false;
  //   obj.stdout("", { clear: true });
  //   const cmd = `esptool.py --chip esp32 --port ${obj.portname} --baud ${obj.baud} erase_flash`;
  //   console.log(cmd);
  //   const child = child_process.exec(cmd);
  //   child.stdout.setEncoding("utf8");
  //   child.stdout.on("data", (text) => {
  //     obj.stdout(text);
  //     received += text;
  //     if (received.indexOf("Chip erase completed successfully") >= 0) {
  //       // 終わったっぽい
  //       success = true;
  //     }
  //   });
  //   child.stderr.on("data", (text) => {
  //     obj.stdout(text);
  //     received += text;
  //   });
  //   child.on("error", (err) => {
  //     reject(err);
  //   });
  //   child.on("exit", () => {
  //     resolve(success);
  //   });
  // });
};
