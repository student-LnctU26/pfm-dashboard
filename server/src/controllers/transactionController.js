const Transaction = require("../models/Transaction");
require("../models/Account");

//Add Transaction
const addTransaction = async (req, res) => {
    try {
        const {
            account,
            amount,
            category,
            merchant,
            type,
        } = req.body;

        const transaction = new Transaction({
            user: req.user.id,
            account,
            amount,
            category,
            merchant,
            type,
        });

        await transaction.save();

        res.status(201).json({
            message: "Transaction added",
            transaction,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

//GET USER TRANSACTION
const getTransactions = async (req, res) => {

    try {

        const transactions = await Transaction.find({
            user: req.user.id,
        }).populate("account");

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    addTransaction,
    getTransactions,
};