const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

//Login User
const loginUser = async(req, res) => {
   const { email, password } = req.body;

   //Find user 
   const user = await User.findOne({ email });

   if(!user) {
      return res.status(400).json({
         message: "Invalid email or password",
      });
   }

   //Compare Password
   const isMatch = await bcrypt.compare(password, user.password);

   if(!isMatch) {
      return res.status(400).json({
         message: "Invalid email or password",
      });
   }

   //Generate JWT Token
   const token = jwt.sign(
      { id: user._id },
      "mysecretkey",
      { expiresIn: "7d"}
   );

   res.status(200).json({
      message: "Login successful",
      token,
   });
};

module.exports = {
    registerUser,
    loginUser,
};