const express = require("express");
const verifyToken = require("../middlewares/auth");
const { getWorkSessionType, getWorkSessionInfo, getWorkSession } = require("../controllers/ModuleController");
const route = express.Router();

route.get ('/get-work-session-type', verifyToken, getWorkSessionType);
route.get ('/get-work-session-info/:id', verifyToken, getWorkSessionInfo);
route.get ('/get-work-session', verifyToken, getWorkSession);

module.exports = route;

