"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const user_1 = __importDefault(require("../models/user"));
const middleware_1 = __importDefault(require("../middleware"));
const ROUNDS = 10;
const { TOKEN_SECRET } = process.env;
const invalidLogin = (res) => res.status(400).json({ error: 'Invalid login.' });
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const hash = yield bcrypt_1.default.hash(password, ROUNDS);
    const newUser = new user_1.default({ email, password: hash });
    try {
        const user = yield newUser.save();
        return res.status(201).json({ token: generateToken(user.toObject()) });
    }
    catch (err) {
        return res.status(400).json({ error: `${err.name}: ${err.message}` });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_1.default.findOne({ email }).lean();
    if (!user)
        return invalidLogin(res);
    bcrypt_1.default.compare(password, user.password, (error, match) => {
        if (error)
            return res.status(500).json({ error });
        if (match)
            return res.status(200).json({ token: generateToken(user) });
        return invalidLogin(res);
    });
}));
router.get('/verify-token', middleware_1.default.verify, (req, res) => (res.status(200).json({ user: req.user })));
function generateToken(user) {
    const { password } = user, data = __rest(user, ["password"]); // strip out the password
    return jsonwebtoken_1.default.sign({ data }, TOKEN_SECRET, { expiresIn: '24h' });
}
exports.default = router;
//# sourceMappingURL=auth.js.map