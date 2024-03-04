import bodyParser from "body-parser";
import * as child_process from "child_process";
import express from "express";
import http from "http";
import path from "path";

import getPort from "get-port";
export async function start() {
  delete process.env.ELECTRON_RUN_AS_NODE;
  child_process.spawnSync("./node_modules/.bin/electron", ["dist/gui/main.js"], {
    env: { ...process.env },
    stdio: "inherit",
  });
}
