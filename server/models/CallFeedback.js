const mongoose = require("mongoose");

const callFeedbackSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    feedback: {
      type: String,
      default: "",
    },
    giveExtraPoints: {
      type: Boolean,
      default: false,
    },
    pointsAwarded: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

callFeedbackSchema.index({ roomId: 1, from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model("CallFeedback", callFeedbackSchema);
