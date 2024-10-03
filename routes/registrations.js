const express = require("express");
const verifyToken = require("../middlewares/auth");
const { wrapToken, untokenize, getItems, getItem, getTeacherDetails } = require("../controllers/RegistrationController");
const route = express.Router();

route.post ('/wrap-token', verifyToken, wrapToken);
route.get ('/untokenize', verifyToken, untokenize);
route.get ('/', verifyToken, getItems);
route.get ('/:id', verifyToken, getItem);
route.get ('/teacher/get-details', verifyToken, getTeacherDetails)

module.exports = route;

