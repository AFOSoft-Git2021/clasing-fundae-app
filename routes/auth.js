const express = require("express");
const jwt = require("jsonwebtoken");
//const UserProfile = require("../models/UserProfile");
const route = express.Router();

route.get ('/', (req, res) => {
    
    const token = jwt.sign({user_id: 643, worksession_type:0, worksession_id:1356},process.env.JWT_KEY, { expiresIn: 60 * 60 * 24 });
    res.send(token);
});

module.exports = route;