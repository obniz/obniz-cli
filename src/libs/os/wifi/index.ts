import chalk from "chalk";
import wifi from "node-wifi";
import { Ora } from "ora";
import { getOra } from "../../ora-console/getora";
const ora = getOra();
import { NetworkInterfaceInfo, networkInterfaces } from "os";
import config from "../config";

export default class WiFi {
  public stdout: any;
  public onerror: any;

  constructor(obj: { stdout: any; onerror: any }) {
    this.stdout = obj.stdout;
    this.onerror = obj.onerror;
    wifi.init({
      iface: null,
    });
  }

  public async setNetwork(configs: any, duplicate: boolean = true, signal?: AbortSignal) {
    let spinner;
    const successIds = [];
    while (true) {
      try {
        if (signal?.aborted) {
          break;
        }
        spinner = ora(`Wi-Fi Scanning...`).start();
        let networks;
        while (true) {
          networks = await this.scanObnizWiFi(30 * 1000);
          if (signal?.aborted) {
            throw new Error(`Aborted.`);
          }
          if (networks.length === 0) {
            continue;
          }
          break;
        }
        for (let i = 0; i < networks.length; i++) {
          const network = networks[i];
          if (!duplicate && successIds[network.ssid]) {
            continue;
          }
          if (i !== 0) {
            spinner = ora(``).start();
          }
          try {
            // Connect access point
            spinner.text = `Found ${chalk.green(network.ssid)}. Connecting...`;
            try {
              await wifi.connect({ ssid: network.ssid });
            } catch (e) {
              throw new Error(`Connection to ${chalk.green(network.ssid)} failed`);
            }

            const destIP = guessObnizIP();
            console.log(destIP);
            spinner.text = `Connected ${chalk.green(network.ssid)}. IP=${destIP} Configuring...`;
            if (destIP === "1.2.3.4" || destIP === "192.168.0.1") {
              const succeed = await this.setForUnder350Devices(destIP, spinner, configs);
              if (!succeed) {
                continue;
              }
              spinner.succeed(`Configuration sent ${chalk.green(network.ssid)}`);
            } else {
              const succeed = await this.setForEqualOrOver350Devices(destIP, spinner, configs);
              if (!succeed) {
                continue;
              }
              spinner.succeed(`Configuration Saved and Device Rebooted ${chalk.green(network.ssid)}`);
            }
            successIds[network.ssid] = true;
          } catch (e) {
            spinner.fail(`${chalk.green(network.ssid)} Configuration failed reson=${e.toString()}`);
          }
        }
      } catch (e) {
        spinner?.fail(`${e.toString()}`);
      }
    }
  }

  private async setForUnder350Devices(targetIP: string, spinner: Ora, configs: any) {
    // Configure network via wifi
    const networks = configs.networks;
    if (!networks) {
      throw new Error(`please provide "networks". see more detail at example json file`);
    }
    if (!Array.isArray(networks)) {
      throw new Error(`"networks" must be an array`);
    }
    if (networks.length !== 1) {
      throw new Error(`"networks" must have single object in array.`);
    }
    const network = networks[0];
    const type = network.type;
    const setting = network.settings;

    let getCount = 0;
    let responseBody = "";
    while (true) {
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      try {
        const httpResponse: any = await new Promise((resolve, reject) => {
          const timeout = 3000;
          setTimeout(() => {
            reject(new Error(`Timed out ${timeout}`));
          }, timeout);
          fetch(`http://${targetIP}/`)
            .then((result) => {
              resolve(result);
            })
            .catch((e) => {
              reject(e);
            });
        });
        if (httpResponse.ok) {
          responseBody = await httpResponse.text();
          break;
        }
      } catch (e) {
        // ignore fetching error
      }
      ++getCount;
      spinner.text = `${chalk.green(network.ssid)} Connecting HTTP Server... ${getCount}`;
      if (getCount >= 4) {
        throw new Error(`${chalk.green(network.ssid)} HTTP Communication Failed ${getCount} times. abort`);
      }
    }

    if (this.isSettingMode(responseBody)) {
      await this.sendReset(spinner, network.ssid);
      spinner.succeed(`Network Reset done. ${chalk.green(network.ssid)}`);
      return false;
    }

    // Send HTTP Request
    let url = "http://192.168.0.1/";
    if (type === "wifi") {
      url = "http://192.168.0.1/";
    } else if (type === "cellular") {
      url = "http://192.168.0.1/lte";
    } else if (type === "wifimesh") {
      url = "http://192.168.0.1/mesh";
    }
    const options = this.createSettingData(type, setting);
    const res = await fetch(url, options);
    if (res.status !== 200) {
      throw new Error(`Configuration failed ${chalk.green(network.ssid)}`);
    }
    return true;
  }

  /**
   * setting configration for OS3.5.0 or older
   * @param spinner Ora object
   * @param configs json user set
   * @returns
   */
  private async setForEqualOrOver350Devices(targetIP: string, spinner: Ora, configs: any) {
    // Configure network via wifi

    let getCount = 0;
    const responseBody = "";

    // Login Loop
    spinner.text = `Logining...`;
    while (true) {
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      try {
        const res: any = await new Promise((resolve, reject) => {
          const timeout = 3000;
          setTimeout(() => {
            reject(new Error(`Timed out ${timeout}`));
          }, timeout);
          fetch(`http://${targetIP}/api/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({ passkey: "obniz" }),
          })
            .then((result) => {
              resolve(result);
            })
            .catch((e) => {
              reject(e);
            });
        });
        if (res.status === 404) {
          // already logged in
          break;
        }
        if (res.status !== 200) {
          throw new Error(`Can't Logged In`);
        }
        break;
      } catch (e) {
        // throw new Error(`Login Error`)
      }
      ++getCount;
      spinner.text = `Accessing and Logining... ${getCount}`;
      if (getCount >= 4) {
        throw new Error(`Login Failed ${getCount} times. abort`);
      }
    }

    // after login
    spinner.text = `Sending JSON`;

    const setRes = await fetch(`http://${targetIP}/api/setting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(configs),
    });
    if (setRes.status !== 201) {
      throw new Error(`Configration Failed with status ${setRes.status}`);
    }
    const options: any = {
      method: "POST",
    };

    spinner.text = `Rebooting`;
    const params = new URLSearchParams();
    params.append("mode", "reboot");
    options.body = params;
    // this will never done. because device will reboot
    fetch(`http://${targetIP}/setting`, options).then();

    return true;
  }

  private isSettingMode(responseBody: string) {
    return responseBody.indexOf(`Normal Launch`) >= 0;
  }

  private async sendReset(spinner: any, identifier: string) {
    // reset_all
    const options = this.createResetData();
    const res = await fetch("http://192.168.0.1/", options);
    if (res.status !== 200) {
      throw new Error(`Resetting Network failed ${chalk.green(identifier)}`);
    }
  }

  /**
   * リセットリクエストを送りWi-Fi設定モードに遷移させる
   * @returns
   */
  private createResetData() {
    const options: any = {
      method: "POST",
    };
    const urlSetting = {
      mode: "reset_all",
    };
    const params = new URLSearchParams();
    (Object.keys(urlSetting) as Array<keyof typeof urlSetting>).forEach((key) => params.append(key, urlSetting[key]));
    options.body = params;
    return options;
  }

  /**
   * ネットワーク設定を送る
   * @param type
   * @param setting
   * @returns
   */
  private createSettingData(type: string, setting: any) {
    const options: any = {
      method: "POST",
    };
    if (type === "wifi") {
      const urlSetting: any = {
        ssid: "other",
        input_ssid: setting.ssid,
        pw: setting.password,
        si: "",
        nm: "",
        gw: "",
        ds: "",
        proxy_ip: "",
        proxy_port: "",
      };
      if (setting.dhcp === false) {
        urlSetting.si = setting.static_ip;
        urlSetting.nm = setting.subnetmask;
        urlSetting.gw = setting.default_gateway;
        urlSetting.ds = setting.dns;
      }
      if (setting.proxy) {
        urlSetting.proxy_ip = setting.proxy_address;
        urlSetting.proxy_port = setting.proxy_port;
      }

      const params = new URLSearchParams();
      Object.keys(urlSetting).forEach((key) => params.append(key, urlSetting[key]));
      options.body = params;
    } else if (type === "wifimesh") {
      const urlSetting: any = {
        ssid: "other",
        input_ssid: setting.ssid,
        pw: setting.password,
        meshid: "",
        si: "",
        nm: "",
        gw: "",
        ds: "",
        proxy_ip: "",
        proxy_port: "",
      };
      if (setting.dhcp === false) {
        urlSetting.si = setting.static_ip;
        urlSetting.nm = setting.subnetmask;
        urlSetting.gw = setting.default_gateway;
        urlSetting.ds = setting.dns;
      }
      if (setting.proxy) {
        urlSetting.proxy_ip = setting.proxy_address;
        urlSetting.proxy_port = setting.proxy_port;
      }
      if (setting.meshid) {
        urlSetting.meshid = setting.meshid;
      }

      const params = new URLSearchParams();
      Object.keys(urlSetting).forEach((key) => params.append(key, urlSetting[key]));
      options.body = params;
    } else if (type === "cellular") {
      const urlSetting = setting;
      const params = new URLSearchParams();
      Object.keys(urlSetting).forEach((key) => params.append(key, urlSetting[key]));
      options.body = params;
    }
    return options;
  }

  private scanObnizWiFi(timeout: number, signal?: AbortSignal): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout. Cannot find any connectable obniz.`));
      }, timeout);

      signal?.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new Error(`Aborted.`));
      });

      wifi.scan((error: Error | null, networks: any[]) => {
        if (error) {
          clearTimeout(timer);
          reject(error);
          return;
        }
        const obnizwifis = [];
        for (const network of networks) {
          const re = /^obniz-[0-9]{8}/;
          if (re.test(network.ssid)) {
            obnizwifis.push(network);
          }
        }
        clearTimeout(timer);
        resolve(obnizwifis);
      });
    });
  }
}

function currentLocalIP() {
  const nets = networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (net.address.startsWith("192.168") || net.address.startsWith("1.2.3.")) {
          return net.address;
        }
      }
    }
  }
  // obnizOS 3.5.0 standard
  return "192.168.254.2";
}

function guessObnizIP() {
  const ip = currentLocalIP();
  if (ip === "1.2.3.5") {
    return "1.2.3.4";
  } else if (ip === "192.168.0.2") {
    return "192.168.0.1";
  } else {
    return "192.168.254.1";
  }
}
