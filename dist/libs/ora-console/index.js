"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const green = "\u001b[32m";
const red = "\u001b[31m";
const reset = "\u001b[0m";
class OraConsole {
    constructor(options) {
        this.color = "black";
        this.indent = 2;
        this.isSpinning = false;
        this.prefixText = "";
        this.spinner = "dots";
        this._text = "";
        if (typeof options === "string") {
            options = {
                text: options,
            };
        }
        console.log(`${green}info: ${reset}${options.text}`);
    }
    set text(t) {
        if (t) {
            console.log(`\u001b[1A\u001b[2K${green}info: ${reset}${t}`);
        }
        this._text = t;
    }
    get text() {
        return this._text;
    }
    clear() {
        return this;
    }
    fail(text) {
        console.log(`fail: ${text}`);
        return this;
    }
    frame() {
        return "";
    }
    info(text) {
        if (text) {
            console.log(`${green}info: ${reset}${text}`);
        }
        return this;
    }
    render() {
        return this;
    }
    start(text) {
        if (text) {
            console.log(`${green}info: ${reset}${text}`);
        }
        return this;
    }
    stop() {
        return this;
    }
    stopAndPersist(options) {
        return this;
    }
    succeed(text) {
        if (text) {
            console.log(`\u001b[1A\u001b[2K${green}info: ${reset}${text}`);
        }
        return this;
    }
    warn(text) {
        console.log(`${red}warn: ${text}`);
        return this;
    }
}
const create = (option) => {
    return new OraConsole(option);
};
exports.default = create;
//# sourceMappingURL=index.js.map