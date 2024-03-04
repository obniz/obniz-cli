"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const get_port_1 = __importDefault(require("get-port"));
const http_1 = __importDefault(require("http"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const opn_1 = __importDefault(require("opn"));
const url_1 = require("./url");
const WebAppId = process.env.APP_ID || `wa_MjI`;
const WebAppToken = process.env.APP_TOKEN || `apptoken_X9jp0G6pbmG_XzC5yIKg9_oo7jMIUA3I2IPG58viAsAVyfHmJWmJYgaxnGzcg1kf`;
exports.default = async (progress, app) => {
    return await new Promise(async (resolve, reject) => {
        // start server
        const port = await get_port_1.default();
        const server = await oauth(port, (app === null || app === void 0 ? void 0 : app.token) || WebAppToken, (err, access_token) => {
            server.close();
            if (err || !access_token) {
                reject(err);
                return;
            }
            resolve(access_token);
        });
        progress(`Local Server Created PORT=${port}. Waiting Permission`);
        const redirect_uri = `http://localhost:${port}/code`;
        const open_url = `${url_1.ObnizIOURL}/login/oauth/authorize?webapp_id=${(app === null || app === void 0 ? void 0 : app.id) ||
            WebAppId}&redirect_uri=${redirect_uri}`;
        opn_1.default(open_url);
    });
};
function oauth(port, appToken, callback) {
    return new Promise((resolve, reject) => {
        let timeout = setTimeout(() => {
            callback(new Error(`Authentication Timeout`), null);
        }, 3 * 60 * 1000);
        const expressApp = express_1.default();
        expressApp.set("port", port);
        expressApp.use(body_parser_1.default.json());
        expressApp.use(body_parser_1.default.urlencoded({ extended: false }));
        expressApp.get("/code", async (req, res, next) => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            const code = req.query.code;
            try {
                const url = new URL(`${url_1.ObnizIOURL}/login/oauth/token`);
                url.searchParams.append("code", code);
                const response = await node_fetch_1.default(url, {
                    method: "post",
                    headers: {
                        "authorization": `Bearer ${appToken}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!response.ok) {
                    res.status(500).send(`Authentication Failed.`);
                    callback(new Error(`Authentication Failed`), null);
                    return;
                }
                const json = await response.json();
                const token = json.token;
                callback(null, token);
            }
            catch (e) {
                res.status(500).send(`Authentication Failed.`);
                callback(e, null);
                return;
            }
            res.send(`Authentication Success. Close this page and back to your shell.`);
        });
        const server = http_1.default.createServer(expressApp);
        server.listen(port);
        server.on("error", (e) => {
            reject(e);
        });
        server.on("listening", () => {
            resolve(server);
        });
    });
}
//# sourceMappingURL=login.js.map