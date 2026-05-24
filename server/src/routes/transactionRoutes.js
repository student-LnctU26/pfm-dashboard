const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    addTransaction,
    getTransactions,
} = require("../controllers/transactionController");

//Add transaction
router.post("/", protect, addTransaction);

//Get transactions
router.get("/", protect, getTransactions);

module.exports = router;