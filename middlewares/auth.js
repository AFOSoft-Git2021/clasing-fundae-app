const jwt = require("jsonwebtoken");

let verifyToken = (req, res, next) => {

    let token = req.get('Authorization');
    jwt.verify(token, process.env.JWT_KEY, (error, decoded) => {

        if (error) {
            return res.status(401).json({
                error
            })
        } 
        req.token = decoded;
        next();
    });
}

module.exports = verifyToken;