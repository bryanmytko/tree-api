import mongoose from 'mongoose';

const model = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  }
});

module.exports = new mongoose.model("User", model);