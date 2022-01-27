const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const model = mongoose.Schema({
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

function generateSlug() {
  return nanoid(10);
}

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
