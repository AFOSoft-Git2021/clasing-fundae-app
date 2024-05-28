const express = require("express");
const verifyToken = require("../middlewares/auth");
const { getWorkSession } = require("../controllers/ModuleController");
const route = express.Router();

route.get ('/get-work-session/:module_id', verifyToken, getWorkSession);

module.exports = route;

