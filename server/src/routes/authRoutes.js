const express = require("express");

const router = express.Router();

const { 
    registerUser,
    loginUser,

 } = require("../controllers/authController");

 //register route
router.post("/register", registerUser);


//login route
router.post("/login", loginUser);

module.exports = router;