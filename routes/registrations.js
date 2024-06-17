const express = require("express");
const verifyToken = require("../middlewares/auth");
const { getItems, getItem, getTeacherDetails } = require("../controllers/RegistrationController");
const route = express.Router();

route.get ('/', verifyToken, getItems);
route.get ('/:id', verifyToken, getItem);
route.get ('/teacher/get-details', verifyToken, getTeacherDetails)

module.exports = route;

