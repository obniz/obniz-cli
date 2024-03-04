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
exports.getClientSdk = void 0;
const graphql_request_1 = require("graphql-request");
const client_1 = require("../generated/client");
const Storage = __importStar(require("../storage"));
const url_1 = require("./url");
function getClientSdk(token) {
    if (!token) {
        token = Storage.get("token");
    }
    const graphQLClient = new graphql_request_1.GraphQLClient(url_1.GraphQLURL, {
        headers: {
            authorization: `Bearer ${token}`,
        },
    });
    const sdk = client_1.getSdk(graphQLClient);
    return sdk;
}
exports.getClientSdk = getClientSdk;
//# sourceMappingURL=sdk.js.map