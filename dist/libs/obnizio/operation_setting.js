"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationSetting = void 0;
const sdk_1 = require("./sdk");
class OperationSetting {
    static async getList(token, operationId) {
        var _a;
        const sdk = sdk_1.getClientSdk(token);
        const ret = await sdk.getOperationSettings({ operationSettingsOperationId: operationId });
        return ((_a = ret === null || ret === void 0 ? void 0 : ret.operationSettings) === null || _a === void 0 ? void 0 : _a.edges) || [];
    }
    static async getByIndication(token, operationId, indicationId) {
        const list = await this.getList(token, operationId);
        return list.find((ops) => { var _a; return ((_a = ops === null || ops === void 0 ? void 0 : ops.node) === null || _a === void 0 ? void 0 : _a.indicationId) === indicationId; });
    }
    static async getFirstTodoOrWipOne(token, operationId) {
        const list = await this.getList(token, operationId);
        return list.find((ops) => { var _a, _b; return ((_a = ops === null || ops === void 0 ? void 0 : ops.node) === null || _a === void 0 ? void 0 : _a.status) === this.status.Todo || ((_b = ops === null || ops === void 0 ? void 0 : ops.node) === null || _b === void 0 ? void 0 : _b.status) === this.status.WorkInProgress; });
    }
    static async updateStatus(token, operationSettingId) {
        const sdk = sdk_1.getClientSdk(token);
        const ret = await sdk.updateOperationSettingStatus({
            updateStatusOperationSettingOperationSettingId: operationSettingId,
        });
    }
}
exports.OperationSetting = OperationSetting;
OperationSetting.status = {
    Todo: 0,
    WorkInProgress: 1,
    Finished: 2,
};
//# sourceMappingURL=operation_setting.js.map