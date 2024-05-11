const express = require("express");
const Registration = require("../models/Registration");
const Course = require("../models/FundaeCourse");
const verifyToken = require("../middlewares/auth");
const route = express.Router();

route.get ('/', verifyToken, (req, res) => {

    const userProfiles = getAllRegistrations();
    userProfiles    
        .then(users => {            
            res.json(users);
        })
        .catch(error => {
            res.status(400).json({
                 error: error
            })
        });
});

async function getAllRegistrations () {
    const registrations = await Registration.findAll({
        include: [{
            model: Course
        }]
    });
    return registrations;
}

module.exports = route;

