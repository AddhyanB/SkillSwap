const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  skillsOffered: [String],
  skillsWanted: [String],
  skillPoints: {
    type: Number,
    default: 0,
  },
  activityLog: {
    type: Map,
    of: Number,
    default: {},
  },
});

module.exports = mongoose.model("User", userSchema);
