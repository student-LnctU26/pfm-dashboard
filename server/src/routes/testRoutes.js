const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

//Protected Route
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        message:"Protected profile route accessed",
        user: req.user,
    });
});

module.exports = router;