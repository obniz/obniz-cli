"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationResult = void 0;
const sdk_1 = require("./sdk");
class OperationResult {
    static async createWriteSuccess(token, operationSettingId, obnizId) {
        const successfullyWrittenAt = new Date().toISOString();
        const typeError = 0;
        const sdk = sdk_1.getClientSdk(token);
        const ret = await sdk.createOperationResult({
            createOperationResultOperationResult: {
                obnizId,
                successfullyWrittenAt,
                typeError,
                operationSettingId,
            },
        });
    }
}
exports.OperationResult = OperationResult;
OperationResult.status = {
    Todo: 0,
    WorkInProgress: 1,
    Finished: 2,
};
//# sourceMappingURL=operation_result.js.map