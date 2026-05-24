const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  category: {
    type: String,
    default: "General",
  },

  merchant: {
    type: String,
  },

  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
},
{
    timestamps: true,
}
);

module.exports = mongoose.model("Transaction", transactionSchema);

