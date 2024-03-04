"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Operation = void 0;
const sdk_1 = require("./sdk");
class Operation {
    static async getList(token) {
        var _a;
        const sdk = sdk_1.getClientSdk(token);
        const ret = await sdk.getOperations();
        return ((_a = ret.operations) === null || _a === void 0 ? void 0 : _a.edges) || [];
    }
    static async getByOperationName(token, name) {
        const list = await this.getList(token);
        return list.find((e) => { var _a; return ((_a = e === null || e === void 0 ? void 0 : e.node) === null || _a === void 0 ? void 0 : _a.name) === name; });
    }
    static async checkPermission(token) {
        var _a;
        try {
            const sdk = sdk_1.getClientSdk(token);
            const ret = await sdk.getTokenPermission();
            const permission = ((_a = ret.token) === null || _a === void 0 ? void 0 : _a.facility) || "none";
            return permission === "full";
        }
        catch (e) {
            return false;
        }
    }
    static checkCanWriteFromCli(operation) {
        if (!operation || !operation.node) {
            throw new Error("operation not found");
        }
        if (operation.node.needLocationNote) {
            throw new Error("Cannot use location note from obniz-cli");
        }
        if (operation.node.needPicEvidence) {
            throw new Error("Cannot use evidence picture from obniz-cli");
        }
        if (operation.node.completionLevel !== 0) {
            throw new Error("obniz-cli only support operation criteria of completion for 'App and network settings are being written'. ");
        }
    }
}
exports.Operation = Operation;
//# sourceMappingURL=operation.js.map