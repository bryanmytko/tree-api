"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const pino_1 = __importDefault(require("pino"));
const auth_1 = __importDefault(require("./routes/auth"));
const node_1 = __importDefault(require("./routes/node"));
const logger = (0, pino_1.default)({
    level: 'info',
    prettyPrint: process.env.NODE_ENV !== 'production'
});
dotenv_1.default.config();
const app = (0, express_1.default)();
const MONGO_URL = process.env.MONGO_URL;
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/node', node_1.default);
if (process.env.NODE_ENV === 'test') {
    module.exports = app;
}
else {
    mongoose_1.default.connect(`${MONGO_URL}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true
    });
    const db = mongoose_1.default.connection;
    db.once('open', () => logger.info('DB connected.'));
    db.on('error', (error) => logger.info('Error:', error));
    app.listen(5000, () => logger.info('Server started...'));
}
//# sourceMappingURL=index.js.map