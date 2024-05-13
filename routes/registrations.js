const express = require("express");
const verifyToken = require("../middlewares/auth");
const { getItems, getItem } = require("../controllers/RegistrationController");
const route = express.Router();

route.get ('/', verifyToken, getItems);
route.get ('/:id', verifyToken, getItem);


module.exports = route;

