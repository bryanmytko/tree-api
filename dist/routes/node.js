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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = __importDefault(require("../models/node"));
const user_1 = __importDefault(require("../models/user"));
const middleware_1 = __importDefault(require("../middleware"));
const recursivelyFindChildren = (obj, searchKey, results = []) => {
    const r = results;
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (key === searchKey) {
            r.push(value.toString());
        }
        else if (key === 'children' && obj[key].length) {
            value.forEach(node => recursivelyFindChildren(node, searchKey, r));
        }
    });
    return r;
};
router.get('/', middleware_1.default.verify, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req.body;
    const nodes = yield node_1.default.find({ user: user._id, parent: null });
    return res.status(200).json({ nodes });
}));
/* This endpoint is deprecated as /:id accomplishes the same */
router.get('/children/:id', middleware_1.default.verify, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    /* Our Node schema has a middleware hook to recursively populate children */
    const node = yield node_1.default.findOne({ _id: id });
    if (!node)
        return res.status(404).json({ error: 'Not found.' });
    return res.status(200).json({ node });
}));
router.get('/:id', middleware_1.default.verify, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const node = yield node_1.default.findById(id)
        .populate({
        path: 'children',
        model: 'Node'
    });
    if (!node)
        return res.status(404).json({ error: 'Not found.' });
    return res.status(200).json({ node });
}));
/* This is a public URL and does not require verification */
router.get('/slug/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: slug } = req.params;
    const node = yield node_1.default.findOne({ slug });
    if (!node)
        return res.status(404).json({ error: 'Not found.' });
    return res.status(200).json({ node });
}));
router.post('/create', middleware_1.default.verify, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, title, payload, parentId = null } = req.body;
    const foundUser = yield user_1.default.findById(user._id);
    const parent = yield node_1.default.findById(parentId);
    if (!foundUser)
        return res.status(400).json({ error: 'User missing.' });
    const newNode = (0, node_1.default)({
        title,
        payload,
        user: user._id,
        parent: parent ? parent._id : null
    });
    if (parent) {
        parent.children.push(newNode);
        yield parent.save();
    }
    try {
        yield newNode.save();
        return res.status(201).json({ node: newNode.toObject() });
    }
    catch (err) {
        return res.status(400).json({ error: `${err.name}: ${err.message}` });
    }
}));
router.put('/update/:id', middleware_1.default.verify, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, payload, private: pr } = req.body;
    yield node_1.default.findByIdAndUpdate(id, { title, payload, private: pr });
    const node = yield node_1.default.findById(id);
    if (!node)
        return res.status(404).json({ error: 'Not found.' });
    return res.status(200).json({ node });
}));
router.put('/private/:id', middleware_1.default.verify, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const node = yield node_1.default.findById(id);
    if (!node)
        return res.status(404).json({ error: 'Not found.' });
    yield node_1.default.findByIdAndUpdate(id, { private: !node.private });
    const updatedNode = yield node_1.default.findById(id);
    return res.status(200).json({ node: updatedNode });
}));
router.delete('/delete/:id', middleware_1.default.verify, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const node = yield node_1.default.findOne({ _id: id });
    /* We don't want to give any insight if the node does not exist */
    if (!node)
        return res.status(200).json({});
    const nodeIds = recursivelyFindChildren(node.toObject(), '_id');
    try {
        yield node_1.default.deleteMany({ _id: { $in: nodeIds } });
        return res.status(200).json({});
    }
    catch (err) {
        return res.status(500), json({ err });
    }
}));
exports.default = router;
//# sourceMappingURL=node.js.map