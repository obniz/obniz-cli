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
Object.defineProperty(exports, "__esModule", { value: true });
const operation_1 = require("../obnizio/operation");
const Storage = __importStar(require("../storage"));
exports.default = {
    help: `Show your operation list
      --token       Token of api key which use instead of user signin.
  `,
    async execute(args) {
        const token = args.token || Storage.get("token");
        if (!token) {
            console.log(`Not Sign In`);
            return;
        }
        if (!(await operation_1.Operation.checkPermission(token))) {
            console.log(`You don't have Facility permission. Please 'obniz-cli signin' again`);
            return;
        }
        console.log(`Contacting to obniz Cloud...`);
        const operations = await operation_1.Operation.getList(token);
        operations.map((op) => {
            var _a;
            console.log(` - ${(_a = op === null || op === void 0 ? void 0 : op.node) === null || _a === void 0 ? void 0 : _a.name} (${op === null || op === void 0 ? void 0 : op.facilityName})`);
        });
    },
};
//# sourceMappingURL=list.js.map