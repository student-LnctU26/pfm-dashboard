const mongoose =require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        accountName: {
            type: String,
            required: true,
        },

        accountType: {
            type:String,
            required: true,
        },

        balance: {
            type: Number,
            default: 0,
        },

        plaidAccountId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Account", accountSchema);