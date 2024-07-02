const express = require("express");
const verifyToken = require("../middlewares/auth");
const { unwrapToken, getWorkSessionType, getWorkSessionInfo, getWorkSession, setWorkSessionActivityResponse, getWorkSessionStatistics, initWorkSession, resetWorkSession } = require("../controllers/ModuleController");
const route = express.Router();

route.get ('/unwrap-token', verifyToken, unwrapToken);
route.get ('/get-work-session-type', verifyToken, getWorkSessionType);
route.get ('/get-work-session-info/:id', verifyToken, getWorkSessionInfo);
route.get ('/get-work-session', verifyToken, getWorkSession);
route.post ('/set-work-session-activity-response', verifyToken, setWorkSessionActivityResponse);
route.get ('/get-work-session-statistics', verifyToken, getWorkSessionStatistics);
route.get ('/init-work-session', verifyToken, initWorkSession);
route.get ('/reset-work-session/:id', verifyToken, resetWorkSession);

module.exports = route;

