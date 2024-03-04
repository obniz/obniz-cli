"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOra = void 0;
const ora_1 = __importDefault(require("ora"));
const index_1 = __importDefault(require("./index"));
const getOra = () => {
    return process.stdout.isTTY ? ora_1.default : index_1.default;
};
exports.getOra = getOra;
//# sourceMappingURL=getora.js.map