const TransactionsSchema = require("../models/transactionsModel.js");
const PortfolioSchema = require("../models/userPortfolioModel.js");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const LastFiveTransaction = require("../models/lastFiveTransactions.js");

const createTransaction = async (req, res) => {
  const { id, quantity, price, spent, date } = req.body;

  const user_id = req.user._id;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  if (!id) {
    return res.status(400).json({ error: "Please provide an ID" });
  }

  if (!quantity) {
    return res.status(400).json({ error: "Please provide a quantity" });
  }

  if (!price) {
    return res.status(400).json({ error: "Please provide a price" });
  }

  if (!spent) {
    return res.status(400).json({ error: "Please provide a spend" });
  }

  if (!date) {
    return res.status(400).json({ error: "Please provide a date" });
  }

  try {
    const transaction = await TransactionsSchema.create({
      id,
      quantity,
      price,
      spent,
      date,
      user_id,
    });

    let portfolio = await PortfolioSchema.findOne({ user_id: user_id });

    if (!portfolio) {
      res.status(404).json({
        error: "portfolio not found",
      });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const userFolio = await PortfolioSchema.findOne({
      user_id: userId,
    }).populate("transactions");

    if (!userFolio) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    res.status(200).json(userFolio.transactions);
  } catch (error) {
    res.status(500).json({
      error:
        "Une erreur s'est produite lors de la récupération du portfolio de l'utilisateur.",
    });
  }
};





const getLastFiveTransactions = async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: "Ethereum address is required." });
  }

  try {
    // Etherscan API key and endpoint
    const apiKey = process.env.ETHERSCAN_API_KEY;
    const etherscanUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&sort=desc&apikey=${apiKey}`;

    // Fetch transactions from Etherscan API
    const response = await fetch(etherscanUrl);
    const data = await response.json();

    if (data.status !== "1") {
      return res.status(500).json({ error: "Failed to fetch transactions." });
    }

    const transactions = data.result.slice(0, 5); // Get the last 5 transactions

    // Process each transaction to map the `timeStamp` to `timestamp` as a Date object
    const processedTransactions = transactions.map(transaction => ({
      ...transaction,
      timestamp: new Date(transaction.timeStamp * 1000), // Convert Unix timestamp to JavaScript Date
    }));

    // Insert transactions while avoiding duplicates
    for (const transaction of processedTransactions) {
      // Remove _id from the document before inserting it into MongoDB
      const { _id, ...transactionWithoutId } = transaction;

      const existingTransaction = await LastFiveTransaction.findOne({ hash: transaction.hash });
      if (!existingTransaction) {
        await LastFiveTransaction.create(transactionWithoutId); 
      }
    }

    res.status(200).json({ message: "Transactions processed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving transactions." });
  }
};




module.exports = { createTransaction, getTransactions, getLastFiveTransactions };
