"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const electron_notarize_1 = require("electron-notarize");
exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== "darwin") {
        return;
    }
    const appName = context.packager.appInfo.productFilename;
    return await electron_notarize_1.notarize({
        appBundleId: "com.obniz.app.writer",
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLEID || "",
        appleIdPassword: process.env.APPLEIDPASS || "",
        ascProvider: process.env.ASC_PROVIDER || "",
        teamId: process.env.ASC_PROVIDER || "",
    });
};
//# sourceMappingURL=notarize.js.map