const express = require("express");
const verifyToken = require("../middlewares/auth");
const { getWorkSessionType, getWorkSessionInfo, getWorkSession, setWorkSessionActivityResponse, getWorkSessionStatistics } = require("../controllers/ModuleController");
const route = express.Router();

route.get ('/get-work-session-type', verifyToken, getWorkSessionType);
route.get ('/get-work-session-info/:id', verifyToken, getWorkSessionInfo);
route.get ('/get-work-session', verifyToken, getWorkSession);
route.post ('/set-work-session-activity-response', verifyToken, setWorkSessionActivityResponse);
route.get ('/get-work-session-statistics', verifyToken, getWorkSessionStatistics);

module.exports = route;

