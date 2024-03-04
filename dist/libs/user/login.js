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
const login_1 = __importDefault(require("../obnizio/login"));
const user_1 = __importDefault(require("../obnizio/user"));
const Storage = __importStar(require("../storage"));
const getora_1 = require("../ora-console/getora");
const ora = getora_1.getOra();
exports.default = async (app) => {
    let spinner = ora(`Singin...`).start();
    const token = await login_1.default((text) => {
        spinner.text = text;
    }, app);
    spinner.succeed(`Authenticated.`);
    spinner = ora(`Getting User Information`).start();
    const user = await user_1.default(token);
    if (!user) {
        spinner.fail("Get user information failed");
        return;
    }
    Storage.set("token", token);
    spinner.succeed(`Sign in as "${user.email}"`);
};
//# sourceMappingURL=login.js.map