const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {

    let token;

    //Check token in headers
    if(
        req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            //get token from header
            token = req.headers.authorization.split(" ")[1];

            //verify token
            const decoded = jwt.verify(token, "mysecretkey");

            //save user info in request 
            req.user = decoded;

            next();
        } catch (error) {
            return res.status(401).json({
                message: "Not authorized, token failed",
            });
        }
    }
    //No token
    if(!token) {
        return res.status(401).json({
            message: "Not authorized, no token",
        });
    }
};

module.exports = protect;