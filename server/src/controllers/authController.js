const User = require("../models/User");

const registerUser = async (req, res) => {
     const {name, email, password } = req.body;

     const user = new User({
        name,
        email,
        password,
     });

     await user.save();

     res.status(201).json({
        message: "User registered successfully",
     });
} ;

module.exports = {
    registerUser,
};