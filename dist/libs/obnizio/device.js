"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_request_1 = require("graphql-request");
const client_1 = require("../generated/client");
const url_1 = require("./url");
class Device {
    static async create(token, opt = {}) {
        const headers = {};
        if (token) {
            headers.authorization = `Bearer ${token}`;
        }
        const input = {
            description: opt.description ? opt.description : "",
            hardware: opt.hardware ? opt.hardware : "esp32w",
            region: opt.region ? opt.region : "jp",
        };
        if (opt.serialdata) {
            input.serialdata = opt.serialdata;
        }
        const graphQLClient = new graphql_request_1.GraphQLClient(url_1.GraphQLURL, {
            headers,
        });
        const sdk = client_1.getSdk(graphQLClient);
        const ret = await sdk.createDevice({ createDeviceDevice: input });
        return ret.createDevice;
    }
    static async get(token, id) {
        var _a, _b;
        const headers = {};
        if (token) {
            headers.authorization = `Bearer ${token}`;
        }
        const graphQLClient = new graphql_request_1.GraphQLClient(url_1.GraphQLURL, {
            headers,
        });
        const sdk = client_1.getSdk(graphQLClient);
        const ret = await sdk.getDeviceById({ deviceId: id });
        const device = ((_b = (_a = ret.devices) === null || _a === void 0 ? void 0 : _a.edges.find((e) => true)) === null || _b === void 0 ? void 0 : _b.node) || null;
        return device;
    }
}
exports.default = Device;
