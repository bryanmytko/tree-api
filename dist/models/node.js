"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const nanoid_1 = require("nanoid");
const model = mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    payload: String,
    slug: {
        type: String,
        default: generateSlug,
        unique: true
    },
    private: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    parent: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Node",
    },
    children: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Node",
        }],
});
function generateSlug() {
    return (0, nanoid_1.nanoid)(10);
}
function populateChildren(next) {
    this.populate({
        path: 'children',
        model: 'Node'
    });
    next();
}
;
model
    .pre('findOne', populateChildren)
    .pre('find', populateChildren);
module.exports = new mongoose_1.default.model("Node", model);
//# sourceMappingURL=node.js.map