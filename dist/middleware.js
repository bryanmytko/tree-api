"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const { TOKEN_SECRET } = process.env;
const verify = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(403).json({ error: 'No auth token provided' });
    }
    jsonwebtoken_1.default.verify(authorization, TOKEN_SECRET, (err, value) => {
        if (err)
            return res.status(403).json({ error: 'Invalid token' });
        req.user = value.data;
        req.body = Object.assign(Object.assign({}, req.body), { user: value.data });
        next();
    });
};
module.exports = { verify };
//# sourceMappingURL=middleware.js.map