import child_process from "child_process";

export default (obj: { portname: string; baud: number; stdout: any }) => {
  return new Promise((resolve, reject) => {
    let received = "";
    let success = false;
    obj.stdout("", { clear: true });
    const cmd = `esptool.py --chip auto --port ${obj.portname} --baud ${obj.baud} erase_flash`;
    console.log(cmd);
    const child = child_process.exec(cmd);
    child.stdout?.setEncoding("utf8");
    child.stdout?.on("data", (text) => {
      obj.stdout(text);
      received += text;
      if (received.indexOf("Chip erase completed successfully") >= 0) {
        // 終わったっぽい
        success = true;
      }
    });
    child.stderr?.on("data", (text) => {
      obj.stdout(text);
      received += text;
    });
    child.on("error", (err) => {
      reject(err);
    });
    child.on("exit", () => {
      resolve(success);
    });
  });
};
