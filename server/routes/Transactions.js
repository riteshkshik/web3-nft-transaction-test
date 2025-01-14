const express = require("express");
const {
  createTransaction,
  getTransactions,
  getLastFiveTransactions,
} = require("../controllers/transactionsController.js");
const requireAuth = require("../middleware/requireAuth.js");

const router = express.Router();

router.use(requireAuth);

// router.post("/", createTransaction);

// router.get("/", getTransactions);
router.post("/get-transactions", getLastFiveTransactions);

module.exports = router;
