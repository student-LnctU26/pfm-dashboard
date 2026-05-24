const express = require("express");

const authRoutes = require("./routes/authRoutes");

const testRoutes = require("./routes/testRoutes");

const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/test", testRoutes);

app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

module.exports = app;