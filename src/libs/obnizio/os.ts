import fs from "fs";
import { GraphQLClient } from "graphql-request";
import fetch from "node-fetch";
import path from "path";
import semver from "semver";
import { getDefaultStorage } from "../storage.js";
import filepath from "./filepath.js";
import { GraphQLURL } from "./url.js";
import { ObnizOsSelect } from "../../types.js";
import { getLogger } from "../logger/index.js";
import { Hardware, Os } from "../generated/client.js";

export default class OS {
  public static async list(hardware: string, type: string | null = null) {
    const headers: Record<string, string> = {};
    const token = getDefaultStorage().get("token");
    if (token && type !== "public") {
      headers.authorization = `Bearer ${token}`;
    }
    const graphQLClient = new GraphQLClient(GraphQLURL, {
      headers,
    });
    const query = `{
      os(hardware: "${hardware}") {
        version,
        app_url,
        bootloader_url,
        partition_url,
        isPublic
      }
    }`;
    const ret: any = await graphQLClient.request(query);
    return ret.os as Os[];
  }

  public static async hardwares(type: string | null = null) {
    const headers: any = {};
    const token = getDefaultStorage().get("token");
    if (token && type !== "public") {
      headers.authorization = `Bearer ${token}`;
    }
    const graphQLClient = new GraphQLClient(GraphQLURL, {
      headers,
    });
    const query = `{
      hardwares {
        hardware
      }
    }`;

    const ret: any = await graphQLClient.request(query);
    return ret.hardwares as Hardware[];
  }

  public static async latestPublic(hardware: string) {
    const versions = await this.list(hardware, "public");
    for (const v of versions) {
      if (!semver.prerelease(v.version)) {
        return v.version;
      }
    }
    throw new Error(`No available obnizOS Found for ${hardware}`);
  }

  public static async os(hardware: string, version: string) {
    const versions = await this.list(hardware, null);
    for (const v of versions) {
      if (v.version === version) {
        return v;
      }
    }
    throw new Error(
      `No obnizOS and Version Found for hardware=${hardware} version=${version}`,
    );
  }

  public static async prepareLocalFile(os: ObnizOsSelect) {
    const logger = getLogger();
    const hardware = os.hardware;
    const version = os.version;
    const appPath = filepath(hardware, version, "app");
    const bootloaderPath = filepath(hardware, version, "bootloader");
    const partitionPath = filepath(hardware, version, "partition");
    let v;
    logger.log(`Downloading files from obnizCloud`);
    if (!fs.existsSync(appPath)) {
      if (!v) {
        v = await this.os(hardware, version);
      }
      logger.debug(`Downloading app from obnizCloud`);
      await downloadFile(v.app_url, appPath);
    }
    if (!fs.existsSync(bootloaderPath)) {
      if (!v) {
        v = await this.os(hardware, version);
      }
      logger.debug(`Downloading bootloader from obnizCloud`);
      await downloadFile(v.bootloader_url, bootloaderPath);
    }
    if (!fs.existsSync(partitionPath)) {
      if (!v) {
        v = await this.os(hardware, version);
      }
      logger.debug(`Downloading partition from obnizCloud`);
      await downloadFile(v.partition_url, partitionPath);
    }
    logger.log(`Download finished`);

    return {
      app_path: appPath,
      bootloader_path: bootloaderPath,
      partition_path: partitionPath,
    };
  }
}

async function downloadFile(url: string, pathtodownload: string) {
  const dirpath = path.dirname(pathtodownload);
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath);
  }

  const res = await fetch(url);
  const fileStream = fs.createWriteStream(pathtodownload);
  await new Promise((resolve, reject) => {
    res.body?.pipe(fileStream);
    res.body?.on("error", (err: any) => {
      reject(err);
    });
    fileStream.on("finish", () => {
      resolve(null);
    });
  });
}
