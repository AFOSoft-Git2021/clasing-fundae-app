const express = require("express");
const verifyToken = require("../middlewares/auth");
const { getItem, setPillViewed } = require("../controllers/PillController");
const route = express.Router();

route.get ('/:id', verifyToken, getItem);
route.post ('/set-viewed', verifyToken, setPillViewed);

module.exports = route;

