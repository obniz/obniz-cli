import chalk from "chalk";
import semver from "semver";

import SerialPort from "serialport";
import KeyPairGen from "../keypair";

const baudRate = 115200;

export default class Serial {
  public portname: string;
  public stdout: any;
  public onerror: any;
  public progress: any;
  public serialport: SerialPort | undefined;

  public totalReceived = "";

  private _recvCallback: any;

  constructor(obj: { portname: string; stdout: any; onerror: any; progress: any }) {
    this.portname = obj.portname;
    this.stdout = obj.stdout;
    this.onerror = obj.onerror;
    this.progress = obj.progress;
  }

  public async open() {
    return new Promise(async (resolve, reject) => {
      this.serialport = new SerialPort(this.portname, { baudRate });

      this.serialport.on("open", () => {
        // open logic
        this.serialport?.set({ rts: false, dtr: false });
        this.serialport?.on("readable", async () => {
          const received = this.serialport?.read()?.toString("utf-8") || "";
          this.totalReceived += received;
          this.stdout(received);
          if (this._recvCallback) {
            this._recvCallback();
          }
        });
        resolve();
      });

      this.serialport.on("error", (err) => {
        reject(err);
        if (this.onerror) {
          this.onerror(err);
        }
      });
    });
  }

  public async close() {
    return new Promise((resolve, reject) => {
      this.serialport?.close(() => {
        resolve();
      });
    });
  }

  public clearReceived() {
    this.totalReceived = "";
  }

  /**
   *
   */
  public async reset() {
    await new Promise(async (resolve, reject) => {
      this.serialport?.set(
        {
          dtr: false,
        },
        (e) => {
          if (e) {
            reject(e);
            return;
          }
          resolve();
        },
      );
    });
    await new Promise((resolve, reject) => {
      setTimeout(resolve, 10);
    });
    await new Promise(async (resolve, reject) => {
      // リセット時にはクリアする
      this.serialport?.set(
        {
          dtr: true,
        },
        (e) => {
          if (e) {
            reject(e);
            return;
          }
          resolve();
        },
      );
    });
  }

  public async waitFor(key: string, timeout: number | undefined = 20 * 1000) {
    return await new Promise((resolve, reject) => {
      let timeoutTimer: null | ReturnType<typeof setTimeout> = setTimeout(() => {
        check();
        this._recvCallback = null;
        reject(new Error(`Timeout. waiting for ${key}`));
      }, timeout);

      const check = () => {
        if (this.totalReceived.indexOf(`${key}`) >= 0) {
          if (timeoutTimer) {
            clearTimeout(timeoutTimer);
            timeoutTimer = null;
          }
          this._recvCallback = null;
          resolve();
        }
      };

      this._recvCallback = () => {
        check();
      };
      check();
    });
  }

  public async detectedObnizOSVersion() {
    let tryCount = 0;
    while (true) {
      try {
        await this.waitFor(`obniz ver:`, 3 * 1000);
        await this.waitFor(`obniz id:`, 3 * 1000);

        const verLine = this._searchLine("obniz ver:");
        let version = "0.0.0";
        if (!verLine) {
          throw new Error(`Failed to check obnizOS version. Subsequent flows can be failed.`);
        }
        version = semver.clean(verLine.split("obniz ver: ")[1]) || "";

        const obnizIDLine = this._searchLine("obniz id:");
        if (!obnizIDLine) {
          throw new Error();
        }
        const obnizid = obnizIDLine.split("obniz id: ")[1];
        return {
          version,
          obnizid,
        };
      } catch (e) {
        ++tryCount;
        if (tryCount <= 2) {
          await this.reset(); // force print DeviceKey
          await new Promise((resolve, reject) => {
            setTimeout(resolve, 2 * 1000);
          });
          if (this.progress) {
            this.progress(chalk.yellow(`Could you reset your device? Can you press reset button?`));
          }
        } else if (tryCount === 3) {
          chalk.yellow(`Seems bad. Trying ReOpening Serial Port`), await this._tryCloseOpenSerial();
        } else {
          // TimedOut
          throw new Error(`Timed out. Target device seems not in normal mode.`);
        }
      }
    }
  }

  /**
   * <3.5.0
   */
  public async waitForSettingMode() {
    let tryCount = 0;
    while (true) {
      try {
        await this.waitFor(`Press 's' to setting mode`, 3 * 1000);
        break;
      } catch (e) {
        ++tryCount;
        if (tryCount <= 2) {
          await this.reset(); // force print DeviceKey
          await new Promise((resolve, reject) => {
            setTimeout(resolve, 2 * 1000);
          });
          if (this.progress) {
            this.progress(chalk.yellow(`Could you reset your device? Can you press reset button?`));
          }
        } else if (tryCount === 3) {
          chalk.yellow(`Seems bad. Trying ReOpening Serial Port`), await this._tryCloseOpenSerial();
        } else {
          // TimedOut
          throw new Error(`Timed out. Target device seems not in normal mode.`);
        }
      }
    }
  }

  /**
   * >= 3.5.0
   */
  public async enterMenuMode() {
    this.clearReceived();
    let i = 0;
    while (1) {
      try {
        this.send(`menu`);
        await this.waitFor("Input number >>", 3 * 1000);
        return;
      } catch (e) {}
      i++;
      if (i > 6) {
        throw new Error(`Failed to entering menu`);
      }
      this.progress(chalk.yellow(`Entering menu ... (try ${i} times)`), { keep: true });
      await this.reset();
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 3 * 1000);
      });
    }
  }

  /**
   * Sending a text
   * @param text
   */
  public send(text: string) {
    try {
      this.serialport?.write(`${text}`);
    } catch (e) {
      this.stdout("" + e);
    }
  }

  /**
   * Setting a Devicekey.
   * @param devicekey
   */
  public async setDeviceKey(devicekey: string) {
    const obnizid = devicekey.split("&")[0];
    if (this.progress) {
      this.progress(`Setting Devicekey obnizID=${chalk.green(obnizid)}`);
    }
    let tryCount = 0;
    while (true) {
      if (this.totalReceived.indexOf(`obniz id: `) >= 0) {
        if (
          this.totalReceived.indexOf(`obniz id: ${obnizid}`) >= 0 ||
          this.totalReceived.indexOf(`obniz id:  ${obnizid}`) >= 0
        ) {
          if (this.progress) {
            this.progress(chalk.yellow(`This device is already configured as obnizID ${obnizid}`));
          }
          return;
        } else {
          throw new Error(
            `This device already configured with different device key. use 'os:erase' to flash your new devicekey`,
          );
        }
      }
      this.send(`\n`);
      try {
        await this.waitFor("DeviceKey", 3 * 1000);
        break;
      } catch (e) {
        ++tryCount;
        if (tryCount <= 5) {
          await this.reset(); // force print DeviceKey
          await new Promise((resolve, reject) => {
            setTimeout(resolve, 2 * 1000);
          });
          this.progress(
            chalk.yellow(
              `Failed Setting devicekey ${tryCount} times. Device seems not launched. Reset the connected device to wake up as Normal Mode`,
            ),
            { keep: true },
          );
        } else if (tryCount === 6) {
          chalk.yellow(
            `Failed Setting devicekey ${tryCount} times. Device seems not launched. Trying ReOpening Serial Port`,
          ),
            await this._tryCloseOpenSerial();
        } else {
          // TimedOut
          throw new Error(`Device seems not launched. Reset the connected device to wake up as Normal Mode`);
        }
      }
    }
    this.send(`${devicekey}\n`);
    try {
      await Promise.race([
        this.waitFor(`obniz id: ${obnizid}`, 10 * 1000),
        this.waitFor(`obniz id:  ${obnizid}`, 10 * 1000),
      ]);
    } catch (e) {
      throw new Error(`Written obniz id not confirmed. maybe success otherwise failed.`);
    }
    await this.reset();
  }

  /**
   * Setting Network Type.
   * @param type
   */
  public async setAllFromMenu(json: any) {
    if (this.progress) {
      this.progress(`Entering menu`);
    }
    await this.enterMenuMode();

    // select json menu
    if (this.progress) {
      this.progress(`Selecting menu`);
    }
    this.clearReceived();
    this.send(`2`); // Configure all from data
    this.send(`\n`);
    await this.waitFor("Network Setting JSON", 10 * 1000);
    await this.waitFor("Input text >>", 10 * 1000);

    // send json
    if (this.progress) {
      this.progress(`Sending JSON`);
    }
    this.clearReceived();
    this.send(JSON.stringify(json));
    this.send("\n");

    // check accepted
    await this.waitFor("Rebooting", 10 * 1000);
  }

  /**
   * Setting Network Type.
   * @param type
   */
  public async setNetworkType(type: "wifi" | "ethernet" | "cellular") {
    if (this.progress) {
      this.progress(`Setting Network Type`);
    }
    await this.waitForSettingMode();
    await this.waitFor("Input char >>", 10 * 1000);
    this.clearReceived();
    this.send(`s`);
    await this.waitFor("-----Select Setting-----", 10 * 1000);
    await this.waitFor("Input number >>", 10 * 1000);
    this.clearReceived();
    this.send(`1`); // Interface
    const interfaces = ["wifi", "ethernet", "cellular"];
    const index = interfaces.indexOf(type);
    if (index < 0) {
      throw new Error(`unknown interface type ${type}`);
    }
    this.send(`${index}`);
  }

  /**
   * Setting WiFi
   * @param obj
   */
  public async setWiFi(setting: any) {
    if (this.progress) {
      this.progress(`Setting Wi-Fi`);
    }
    let version = "";
    try {
      const info = await this.detectedObnizOSVersion();
      version = info.version;
    } catch (e) {
      if (this.progress) {
        this.progress(chalk.yellow("Failed to check obnizOS version. Subsequent flows can be failed."));
      }
    }

    if (semver.satisfies(version, ">=3.4.2")) {
      // Interface
      await this.waitFor("-----Select Interface-----", 30 * 1000);
      await this.waitFor("Input number >>", 10 * 1000);
      this.send(`0`);
      this.clearReceived();
    }

    // SSID
    await this.waitFor("--- Select SSID Number ---", 30 * 1000);
    await this.waitFor("Input number >>", 10 * 1000);
    const line = this._searchLine("-- Other Network --");
    if (!line) {
      throw new Error(`Not Supported OS`);
    }
    let leftside = line.split(":")[0];
    leftside = leftside.replace("-", "");
    const indexNumber = parseInt(leftside);
    if (isNaN(indexNumber)) {
      throw new Error(`Failed to parse serial console. LINE="${line}"`);
    }
    this.send(`${indexNumber}\n`);
    this.clearReceived();
    if (semver.satisfies(version, "<3.4.2")) {
      // Hidden
      await this.waitFor("--- Hidden SSID ---", 10 * 1000);
      await this.waitFor("Input number >>", 10 * 1000);
      if (setting.hidden) {
        this.send(`1`);
      } else {
        this.send(`0`);
      }
      this.clearReceived();
    }
    await this.waitFor("--- SSID ---", 10 * 1000);
    await this.waitFor("Input text >>", 10 * 1000);
    this.send(`${setting.ssid}\n`);
    this.clearReceived();

    // Password
    await this.waitFor("--- Password ---", 10 * 1000);
    await this.waitFor("Input text >>", 10 * 1000);
    this.send(`${setting.password}\n`);
    this.clearReceived();

    // DHCP
    await this.waitFor("--- select Network ---", 10 * 1000);
    await this.waitFor("Input number >>", 10 * 1000);
    if (setting.dhcp === false) {
      this.send(`1`);
      this.clearReceived();

      await this.waitFor("--- IP Address ---", 10 * 1000);
      await this.waitFor("Input address >>", 10 * 1000);
      this.send(`${setting.static_ip}\n`);
      this.clearReceived();

      await this.waitFor("--- Default Gateway ---", 10 * 1000);
      await this.waitFor("Input address >>", 10 * 1000);
      this.send(`${setting.default_gateway}\n`);
      this.clearReceived();

      await this.waitFor("--- Subnet Mask ---", 10 * 1000);
      await this.waitFor("Input address >>", 10 * 1000);
      this.send(`${setting.subnetmask}\n`);
      this.clearReceived();

      await this.waitFor("--- DNS Address ---", 10 * 1000);
      await this.waitFor("Input address >>", 10 * 1000);
      this.send(`${setting.dns}\n`);
      this.clearReceived();
    } else {
      this.send(`0`);
      this.clearReceived();
    }

    // PROXY
    await this.waitFor("--- Proxy Setting ---", 10 * 1000);
    await this.waitFor("Input number >>", 10 * 1000);
    if (setting.proxy) {
      this.send(`1`);
      this.clearReceived();

      await this.waitFor("--- Proxy Config ---", 10 * 1000);
      await this.waitFor("Input text >>", 10 * 1000);
      this.send(`${setting.proxy_address}\n`);
      this.clearReceived();

      await this.waitFor("--- Proxy Port ---", 10 * 1000);
      await this.waitFor("Input number >>", 10 * 1000);
      this.send(`${setting.proxy_port}\n`);
      this.clearReceived();
    } else {
      this.send(`0`);
      this.clearReceived();
    }

    await this.waitFor("Wi-Fi Connecting SSID", 10 * 1000);
    if (this.progress) {
      this.progress(chalk.green("Suceeded"));
    }
  }

  private async _tryCloseOpenSerial() {
    await this.close();
    await this.open();
  }

  private _searchLine(text: string): string | null {
    for (const line of this.totalReceived.split("\n")) {
      if (line.indexOf(text) >= 0) {
        return line;
      }
    }
    return null;
  }
}
