import * as bufferpack from "bufferpack";
import SerialPort from "serialport";

const DEFAULT_CONNECT_ATTEMPTS = 7;
const DEFAULT_TIMEOUT = 3;
const SYNC_TIMEOUT = 0.1;

export default class ESP {
  public _port: SerialPort;
  public _slip_reader;

  // Default baudrate. The ROM auto-bauds, so we can use more or less whatever we want.
  public ESP_ROM_BAUD = 115200;
  // Commands supported by ESP8266 ROM bootloader
  public ESP_SYNC = 0x08;
  public ESP_READ_REG = 0x0a;
  // Response code(s) sent by ROM
  public ROM_INVALID_RECV_MSG = 0x05; // response if an invalid message is received
  // Maximum block sized for RAM and Flash writes, respectively.
  public ESP_RAM_BLOCK = 0x1800;
  public USB_RAM_BLOCK = 0x800; // Max block size USB CDC is used
  public UARTDEV_BUF_NO = 0x3ffffd14; // Variable in ROM .bss which indicates the port in use
  public UARTDEV_BUF_NO_USB = 2; // # Value of the above variable indicating that USB is in use

  constructor(port: string, baud: number) {
    this._port = new SerialPort(port, { baudRate: baud });
    this._slip_reader = slip_reader(this._port);
    this._port.on("open", async () => {
      await this.connect();
    });
  }

  // connect
  /*
   * Try connecting repeatedly until successful, or giving up
   */
  public async connect(mode = "default_reset", attempts = DEFAULT_CONNECT_ATTEMPTS) {
    process.stdout.write("Connecting...");
    let last_error = null;
    try {
      for (let i = 0; i < attempts; i++) {
        last_error = await this._connect_attempt({ mode, esp32r0_delay: false });
        if (last_error === null) {
          break;
        }
        last_error = await this._connect_attempt({ mode, esp32r0_delay: true });
        if (last_error === null) {
          break;
        }
      }
    } finally {
      console.log("");
    }

    if (last_error != null) {
      throw Error(last_error);
    }

    this._post_connect();
  }

  public uses_usb() {
    const buf_no = this.read_reg(this.UARTDEV_BUF_NO) & 0xff;
    return buf_no === this.UARTDEV_BUF_NO_USB;
  }

  public sync() {
    this.command({
      op: this.ESP_SYNC,
      data: [0x07, 0x07, 0x12, 0x20].concat(Array(32).fill(0x55)),
      timeout: SYNC_TIMEOUT,
    });
    for (let i = 0; i < 7; i++) {
      this.command({});
    }
  }

  public command({ op = null, data = [], chk = 0, wait_response = true, timeout = DEFAULT_TIMEOUT }) {
    // timeout??

    if (op !== null) {
      const pkt = Buffer.concat([bufferpack.pack("<BBHI", [0x00, op, data.length, chk]), Buffer.from(data)]);
      this.write(pkt);
    }
    if (!wait_response) {
      return;
    }

    for (let retry = 0; retry < 100; retry++) {
      const p = this.read();
      console.log(p);
      if (p.length < 8) {
        continue;
      }
      const [resp, op_ret, len_ret, val] = bufferpack.unpack("<BBHI", p.slice(0, 8));
      if (resp !== 1) {
        continue;
      }
      const recv_data = p.slice(8);
      console.log(recv_data);

      if (op === null || op_ret === op) {
        return [val, recv_data];
      }
      if (recv_data[0] !== 0 && recv_data[1] === this.ROM_INVALID_RECV_MSG) {
        throw Error("Unsupported command.");
      }
    }

    throw Error("Response doesn't match request");
  }

  public async write(packet: Buffer) {
    // replace?
    const buf = Buffer.concat([Buffer.from([0xc0]), packet, Buffer.from([0xc0])]);
    console.log(buf);
    this._port.write(buf, "ascii");
    this._port.drain();
  }

  public read() {
    const result = this._slip_reader.next();
    return result.value;
  }

  public flush_input() {
    this._slip_reader = slip_reader(this._port);
  }

  public read_reg(addr) {
    const [val, data] = this.command({
      op: this.ESP_READ_REG,
      data: bufferpack.pack("<I", addr),
    });
    if (data[0] !== 0) {
      throw Error(`Failed to read register address ${addr}`);
    }
    return val;
  }

  private _post_connect() {
    if (this.uses_usb()) {
      this.ESP_RAM_BLOCK = this.USB_RAM_BLOCK;
    }
  }

  private async _connect_attempt({ mode = "default_reset", esp32r0_delay = false }) {
    let last_error = null;
    if (mode !== "no_reset") {
      this._setDTR(false); // IO0=HIGH
      this._setRTS(true); // EN=LOW, chip in reset
      await this._sleep(100);
      if (esp32r0_delay) {
        await this._sleep(1200);
      }
      this._setDTR(true); // IO0=LOW
      this._setRTS(false); // EN=HIGH, chip out of reset
      if (esp32r0_delay) {
        await this._sleep(400);
      }
      await this._sleep(50);
      this._setDTR(false); // IO0=HIGH, done
    }

    for (let i = 0; i < 5; i++) {
      try {
        this.flush_input();
        this._port.flush();
        this.sync();
        return null;
      } catch (err) {
        console.log(err);
        if (esp32r0_delay) {
          process.stdout.write("_");
        } else {
          process.stdout.write(".");
        }
        await this._sleep(50);
        last_error = err;
      }
    }
    return last_error;
  }
  // get chip info
  // stub?
  // change baud rate
  // send command

  private _setDTR(state) {
    this._port.set({ dtr: state });
  }

  private _setRTS(state) {
    this._port.set({ rts: state });
  }

  private _sleep(msec) {
    return new Promise((resolve) => setTimeout(resolve, msec));
  }
}

function* slip_reader(port) {
  let partial_packet = null;
  let in_escape = false;
  while (true) {
    const read_bytes: null | Buffer = port.read();
    const waiting_for = partial_packet === null ? "header" : "content";
    if (read_bytes === null) {
      throw Error(`Timed out waiting for packet ${waiting_for}`);
    }
    console.log(read_bytes.toString("hex"));
    for (const b of read_bytes) {
      if (partial_packet === null) {
        // waiting for packet header
        if (b === 0xc0) {
          // header
          partial_packet = Buffer.from([]);
        } else {
          throw Error(`Invalid head of packet (${Number(b).toString(16)})`);
        }
      } else if (in_escape) {
        in_escape = false;
        if (b === 0xdc) {
          partial_packet = Buffer.concat([partial_packet, 0xc0]);
        } else if (b === 0xdd) {
          partial_packet = Buffer.concat([partial_packet, 0xdb]);
        } else {
          throw Error(`Invalid SLIP escape (0xdb, 0x${Number(b).toString(16)})`);
        }
      } else if (b === 0xdb) {
        // start of escape sequence
        in_escape = true;
      } else if (b === 0xc0) {
        // end of packet
        yield partial_packet;
        partial_packet = null;
      } else {
        // normal byte in packet
        partial_packet = Buffer.concat([partial_packet, b]);
      }
    }
  }
}
