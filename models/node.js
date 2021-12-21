const mongoose = require('mongoose');

const model = mongoose.Schema({
  title: String,
  payload: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Node",
  }
});

module.exports = new mongoose.model("Node", model);
