const express = require("express");
const verifyToken = require("../middlewares/auth");
const { getItem } = require("../controllers/PillController");
const route = express.Router();

route.get ('/:id', verifyToken, getItem);

module.exports = route;

