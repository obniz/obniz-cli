"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = exports.set = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const filepath = path_1.default.join(__dirname, "../..", "storage.json");
function read() {
    let obj = {};
    try {
        const txt = fs_1.default.readFileSync(filepath, { encoding: "utf8" });
        obj = JSON.parse(txt);
    }
    catch (e) { }
    return obj;
}
function write(obj) {
    fs_1.default.writeFileSync(filepath, JSON.stringify(obj));
}
function set(key, value) {
    const obj = read();
    obj[key] = value;
    write(obj);
}
exports.set = set;
function get(key) {
    return read()[key];
}
exports.get = get;
//# sourceMappingURL=storage.js.map