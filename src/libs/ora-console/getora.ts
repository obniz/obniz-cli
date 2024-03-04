import ora from "ora";
import oraConsole from "./index";

const getOra: any = () => {
  return process.stdout.isTTY ? ora : oraConsole;
};

export { getOra };
