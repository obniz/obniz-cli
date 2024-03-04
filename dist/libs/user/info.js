"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../obnizio/user"));
const Storage = __importStar(require("../storage"));
exports.default = async () => {
    const token = Storage.get("token");
    if (!token) {
        console.log(`Not Sign In`);
        return;
    }
    console.log(`Contacting to obniz Cloud...`);
    const user = await user_1.default(token);
    if (!user) {
        console.log(`Authentication Failed.`);
        return;
    }
    console.log(`Signin In User`);
    console.log(` name : ${user.name}`);
    console.log(` email: ${user.email}`);
};
//# sourceMappingURL=info.js.map