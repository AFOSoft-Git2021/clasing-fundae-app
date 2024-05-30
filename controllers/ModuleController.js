const RegistrationModule = require("../models/RegistrationModule");
const RegistrationModuleActivity = require("../models/RegistrationModuleActivity");
const Activity = require("../models/Activity");
const ActivityQuestion = require("../models/ActivityQuestion");
const ActivityQuestionAnswer = require("../models/ActivityQuestionAnswer");
const fs = require('fs').promises;
const jwt = require("jsonwebtoken"); 

/*
* @param {*} req  
*/

const getWorkSessionType = (req, res) => {

    if (req.token) {

        const workSessionId = req.token.worksession_id;
        const workSessionType = req.token.worksession_type;
        if (workSessionType == 0) {

            const registrationModule = getRegistrationModule(workSessionId);
            registrationModule
            .then(registrationModule => {

                res.status(200).json({
                    status: "ok",
                    code: 200,
                    message: "Work Session Type recovered successfully",
                    worksession_type: workSessionType,
                    module_name: registrationModule.name
                })
            })
            .catch (error => {
                res.status(400).json({
                    error: error
                })
            })
        } else {
            res.status(200).json({
                status: "ok",
                code: 200,
                message: "Work Session Type recovered successfully",
                worksession_type: worksessionType,
                module_name: ""
            })
        }

    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }
}

const getWorkSessionInfo = (req, res) => {

    if (req.token) {

        const workSessionId = req.params.id;

        if (workSessionId) {

            let workSessionInfo = new Object();

            const registrationModule = getRegistrationModule(workSessionId);
            registrationModule
            .then(registrationModule => {

                workSessionInfo.name = registrationModule[0].name;
                workSessionInfo.threshold = registrationModule[0].threshold;

                const activities = getRegistrationModuleActivities(workSessionId);
                return activities;
            })
            .then(activities => {

                workSessionInfo.num_activities = activities.length;
                let workSessionInitiated = false;
                activities.forEach (activity => {
                    if (activity.result > 0) {
                        workSessionInitiated = true;
                    }
                }); 

                workSessionInfo.status = workSessionInitiated ? 1 : 0;

                const token = jwt.sign({user_id: req.token.user_id, worksession_type:0, worksession_id:workSessionId},process.env.JWT_KEY, { expiresIn: 60 * 60 * 24 });

                res.status(200).json({
                    status: "ok",
                    code: 200,
                    message: "Work Session Info recovered successfully",
                    work_session_info: workSessionInfo,
                    jwt: token
                })
            })
            .catch(error => {
                res.status(400).json({
                    error: "Work Session data error"
                })
            })

        } else {
            res.status(400).json({
                error: "Param data not found"
            })
        }
            
    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }

}

const getWorkSession = (req, res) => {

    if (req.token) {

        const workSessionId = req.token.worksession_id;

        if (workSessionId) {            
            
            //TODO: ReferenceError: getRegistrationModuleActivities is not defined
            const activities = getRegistrationModuleActivities(workSessionId);
            activities    
                .then(activities => {   
        
                    const mapLoop = async activities => {

                        console.log('Start');

                        let promises;
                        let promises1;
                        let promises2;
                        let promises3;

                        if(activities.length > 0) {

                            let activitiesArray = [];
                            promises = activities.map(async activity => {

                                const activities2 = await getActivity(activity.activity_id);
                                if (activities2.length == 1) {

                                    promises1 = activities2.map(async activity2 => {

                                        const activityQuestions = await getActivityQuestions(activity2.id);
                                        if (activityQuestions.length == 1) { 

                                            promises2 = activityQuestions.map(async activityQuestion => {

                                                const activityQuestionsAnswers = await getActivityQuestionsAnswers(activityQuestion.id);
                                                if (activityQuestionsAnswers.length > 0) {     

                                                    let newActivity = new Object();
                                                    newActivity.id = activity.id;
                                                    newActivity.format_id = activity2.format_id;
                                                    newActivity.course_id = activity2.course_id;
                                                    newActivity.difficulty_level = activity2.difficulty_level;
                                                    newActivity.order = activity.order;
                                                    newActivity.result = activity.result;
                                                    newActivity.in_use = activity.in_use;
                                                    newActivity.question = activityQuestion.question;
                                                    newActivity.explanation = activityQuestion.explanation ? activityQuestion.explanation : "";
                                                    newActivity.text = "";
                                                    newActivity.answers = [];

                                                    activityQuestionsAnswers.forEach ( activityQuestionAnswer => {
                                                        let newAnswer = new Object();
                                                        newAnswer.response = activityQuestionAnswer.response;
                                                        newAnswer.correct = activityQuestionAnswer.correct;
                                                        newAnswer.order = activityQuestionAnswer.order;

                                                        newActivity.answers.push(newAnswer);
                                                    })

                                                    if (activityQuestion.text !== null) {

                                                        // read file asynchronously
                                                        html = await fs.readFile("./storage/texts/" + activityQuestion.text + ".html", "utf8");
                                                                
                                                        newActivity.text = html;
                                                        activitiesArray.push(newActivity);
                                                    
                                                    } else {
                                                        activitiesArray.push(newActivity);
                                                    }
                                                } 

                                                return activityQuestionsAnswers;

                                            });
                                        }
                                        
                                        return activityQuestions;
                                    });
                                }

                                return activities2;
                            });
                            
                            await Promise.all(promises)
                            .then (async _ => {
                                if (promises1) {
                                    await Promise.all(promises1)
                                }
                            })
                            .then (async _ => {      
                                if (promises2) {
                                    await Promise.all(promises2)
                                }
                            })
                            .then (async _ => {    

                                activitiesArray.forEach (activity => {
                                    
                                    let html = activity.text.replace(/\r\n/gi,'');

                                    let noBody = html.split("<body>");
                                    if (noBody.length == 2) {
                                        noBody = noBody[1].split("</body>");
                                        if (noBody.length == 2) {
                                            noBody = noBody[0].split("</h3>");
                                            if (noBody.length == 2) {
                                                html = noBody[1];                            
                                            }                            
                                        }
                                    }

                                    activity.text = html;
                                });

                                res.status(200).json({
                                    status: "ok",
                                    code: 200,
                                    message: "Work Session recovered successfully",
                                    activities: activitiesArray
                                })
                                
                            })
                            
                        } else {
                            res.status(400).json({
                                error: "Registration not found"
                            })    
                        }

                        console.log('End');
                    }

                    mapLoop(activities);
                    
                })
                .catch(error => {
                    res.status(400).json({
                        error: "File identificator not found"
                })
            });
        } else {
            res.status(400).json({
                error: "JWT not contains WorkSession Data"
            })
        }
            
    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }

}

async function getRegistrationModule(id) {
    const registrationModule = await RegistrationModule.findAll({
        attributes: ['id','name','threshold','order','status','score'],
        where: {
            id
        }
    });

    return registrationModule;
}

async function getActivity(id) {
    const activityQuestions = await Activity.findAll({
        attributes: ['id','code','difficulty_level','course_id','format_id'],
        where: {
            id
        }
    });

    return activityQuestions;
}

async function getRegistrationModuleActivities(module_id) {

    const activities = await RegistrationModuleActivity.findAll({
        attributes: ['id','result','in_use','order','activity_id'],
        where: {
            module_id
        },
        order: [
            ['id', 'ASC']
        ],
        
    });

    return activities;
}

async function getActivityQuestions(activity_id) {
    const activityQuestions = await ActivityQuestion.findAll({
        attributes: ['id','order','question','explanation','text','question_image','question_audio','answers_image','answers_audio'],
        where: {
            activity_id
        }
    });

    return activityQuestions;
}

async function getActivityQuestionsAnswers(question_id) {

    const activityQuestionsAnswers = await ActivityQuestionAnswer.findAll({
        attributes: ['id','response','correct','order'],
        where: {
            question_id
        }
    });

    return activityQuestionsAnswers;

}

module.exports = { getWorkSessionType, getWorkSessionInfo, getWorkSession };