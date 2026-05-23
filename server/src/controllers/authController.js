const User = require("../models/User");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
     const {name, email, password } = req.body;

     //check existing user 
     const existingUser = await User.findOne({ email });

     if(existingUser) {
      return res.status(400).json({
         meassage:"User already exists",
      });
     }

     //Hash Password
     const hashedPassword = await bcrypt.hash(password, 10);

     //Create new User
     const user = new User({
        name,
        email,
        password: hashedPassword,
     });

     //Save user in database
     await user.save();

     //success response 
     res.status(201).json({
        message: "User registered successfully",
     });
} ;

module.exports = {
    registerUser,
};