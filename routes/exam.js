const express = require("express");
const verifyToken = require("../middlewares/auth");
const { getExamInfo, getExam, setExamActivityResponse, getExamStatistics } = require("../controllers/ExamController");
const route = express.Router();

route.get ('/get-exam-info/:id', verifyToken, getExamInfo);
route.get ('/get-exam', verifyToken, getExam);
route.post ('/set-exam-activity-response', verifyToken, setExamActivityResponse);
route.get ('/get-exam-statistics', verifyToken, getExamStatistics);

module.exports = route;

