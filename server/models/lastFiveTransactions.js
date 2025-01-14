const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    hash: { type: String, required: true, unique: true },  // Make `hash` unique
    from: { type: String, required: true },
    to: { type: String, required: true },
    value: { type: String, required: true },
    timestamp: { type: Date, required: true },
    blockNumber: { type: String, required: true },
    gasUsed: { type: String, required: true },
    gasPrice: { type: String, required: true },
    transactionIndex: { type: String, required: true },
  });
  
  
  const lastFiveTransactions = mongoose.model("lastFiveTransactions", transactionSchema);
  
  module.exports = lastFiveTransactions;
  
