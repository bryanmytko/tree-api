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
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Node",
  }],
});

function populateChildren(next) {
  this.populate({
    path: 'children',
    model: 'Node'
  });

  next();
};

model
  .pre('findOne', populateChildren)
  .pre('find', populateChildren)

module.exports = new mongoose.model("Node", model);
