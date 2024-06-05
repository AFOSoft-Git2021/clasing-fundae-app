const RegistrationModule = require("../models/RegistrationModule");
const RegistrationModuleActivity = require("../models/RegistrationModuleActivity");
const Activity = require("../models/Activity");
const ActivityFormat = require("../models/ActivityFormat");
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
                    module_name: registrationModule[0].name
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
            
            let numActivities = 0;
            const moduleActivities = getRegistrationModuleActivities(workSessionId);
            moduleActivities    
                .then(async moduleActivities => {   

                    console.log("START");

                    let activitiesArray = [];

                    for (const moduleActivity of moduleActivities) {
                        
                        const activities = await getActivity(moduleActivity.activity_id);
                        
                        if (activities.length == 1) {     
                            
                            for (const activity of activities) {
                            
                                const activityQuestions = await getActivityQuestions(activity.id);

                                if (activityQuestions.length == 1) { 
                                    
                                    for (const activityQuestion of activityQuestions) {
                            
                                        const activityQuestionAnswers = await getActivityQuestionsAnswers(activityQuestion.id);
                                        if (activityQuestionAnswers.length > 0) { 

                                            // Buscamos el description del formato de la actividad
                                            const activityFormats = await getActivityFormat(activity.format_id);
                                            if (activityFormats.length == 1) {

                                                //TODO: Copiar el método de calcular skill y viewMode de CLGo
                                                // De momento, aleatorio
                                                //const skillId = Math.floor(Math.random() * 4) + 1;
                                                //const viewMode = (skillId == 3) ? Math.floor(Math.random() * 2) + 1 : 0; 

                                                let acronymunFormat = "";
                                                switch(activity.format_id) {

                                                    case 1:
                                                        acronymunFormat = "GR";
                                                        break;
                                                    case 2:
                                                        acronymunFormat = "TS";
                                                        break;
                                                    case 3:
                                                        acronymunFormat = "FG";
                                                        break;
                                                    case 4:
                                                        acronymunFormat = "TT";
                                                        break;
                                                    case 5:
                                                        acronymunFormat = "TSC";
                                                        break;
                                                    case 6:
                                                        acronymunFormat = "T1W";
                                                        break;
                                                    case 7:
                                                        acronymunFormat = "RR";
                                                        break;
                                                }

                                                let acronymunCourse = "";
                                                switch(activity.course_id) {

                                                    case 1:
                                                        acronymunCourse = "A1";
                                                        break;
                                                    case 2:
                                                        acronymunCourse = "A2";
                                                        break;
                                                    case 3:
                                                        acronymunCourse = "B1";
                                                        break;
                                                    case 4:
                                                        acronymunCourse = "B2";
                                                        break;
                                                    case 5:
                                                        acronymunCourse = "C1";
                                                        break;
                                                    case 6:
                                                        acronymunCourse = "C2";
                                                        break;
                                                }

                                                let questionAudio = "";
                                                if (activityQuestion.question_audio !== null && activityQuestion.question_audio.trim() == "1") {
                                                    questionAudio = "audios/" + acronymunCourse + "/" + acronymunFormat + "/" + activity.code.trim().toUpperCase() + "-q.mp3";
                                                } else {

                                                    let audioName = "";

                                                    if (activityQuestion.question_audio !== null && activityQuestion.question_audio.trim() != "") {
                                                        if (acronymunFormat != "T1W") {
                                                            audioName = "audios/" + acronymunCourse + "/" + acronymunFormat + "/" + activityQuestion.question_audio.trim();
                                                        } else {
                                                            audioName = "audios/A1/TT/" + activityQuestion.question_audio.trim(); 
                                                        }

                                                        questionAudio = audioName;
                                                    }
                                                }

                                                const arraySkillViewMode = setActivitySkillAndViewMode(activity.format_id, activityQuestion.question_audio, activityQuestion.answers_audio);

                                                let newActivity = new Object();
                                                newActivity.id = activity.id;
                                                newActivity.description = activityFormats[0].description;
                                                newActivity.format_id = activity.format_id;
                                                newActivity.course_id = activity.course_id;
                                                //newActivity.skill_id = skillId,
                                                //newActivity.view_mode = viewMode, 
                                                newActivity.skill_id = (arraySkillViewMode.length == 2) ? arraySkillViewMode[0] : 1,
                                                newActivity.view_mode = (arraySkillViewMode.length == 2) ? arraySkillViewMode[1] : 0,
                                                newActivity.difficulty_level = activity.difficulty_level;
                                                newActivity.order = moduleActivity.order;
                                                newActivity.result = moduleActivity.result;
                                                newActivity.in_use = moduleActivity.in_use;
                                                newActivity.question = activityQuestion.question;
                                                newActivity.question_audio = questionAudio;
                                                newActivity.explanation = activityQuestion.explanation ? activityQuestion.explanation : "";
                                                newActivity.text = "";
                                                newActivity.answers = [];

                                                //console.log("question_audio", questionAudio)

                                                activityQuestionAnswers.forEach ( activityQuestionAnswer => {

                                                    let answersAudio = "";
                                                    
                                                    if (activityQuestion.answers_audio !== null && activityQuestion.answers_audio.trim() != "0") {
                                                        answersAudio = "audios/" + acronymunCourse + "/" + acronymunFormat + "/" + activity.code.trim().toUpperCase() + '-r' + activityQuestionAnswer.order + ".mp3";
                                                    }

                                                    let newAnswer = new Object();
                                                    newAnswer.response = activityQuestionAnswer.response;
                                                    newAnswer.correct = activityQuestionAnswer.correct;
                                                    newAnswer.order = activityQuestionAnswer.order;
                                                    newAnswer.answer_audio = answersAudio;

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
                                        }
                                    }
                                }
                            }
                        }
                    }

                    console.log("END");

                    res.status(200).json({
                        status: "ok",
                        code: 200,
                        message: "Work Session recovered successfully",
                        
                        activities: activitiesArray
                    })
                })
                .catch(error => {
                    res.status(400).json({
                        error: error
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

const getWorkSession_BAK = (req, res) => {

    if (req.token) {

        const workSessionId = req.token.worksession_id;

        if (workSessionId) {            
            
            let numActivities = 0;
            const activities = getRegistrationModuleActivities(workSessionId);
            activities    
                .then(activities => {   

                    numActivities = activities.length;
        
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

                                                    //TODO: Copiar el método de calcular skill y viewMode de CLGo
                                                    // De momento, aleatorio
                                                    const skillId = Math.floor(Math.random() * 4) + 1;
                                                    const viewMode = (skillId == 3) ? Math.floor(Math.random() * 2) + 1 : 0; 

                                                    let newActivity = new Object();
                                                    newActivity.id = activity.id;
                                                    newActivity.format_id = activity2.format_id;
                                                    newActivity.course_id = activity2.course_id;
                                                    newActivity.skill_id = skillId,
                                                    newActivity.view_mode = viewMode, 
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
                            
                            for await (const e of promises) { 
                                await e
                                console.log (e)
                                for await (const e1 of promises1) {
                                    await e1
                                    for await (const e2 of promises2) await e2
                                }
                            }
                             
                            

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
                                    num_activities: numActivities,
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

async function getActivityFormat(id) {

    const activityFormats = await ActivityFormat.findAll({
        attributes: ['id','name','description','prefix'],
        where: {
            id
        }
    });

    return activityFormats;

}

async function getRegistrationModuleActivities(module_id) {

    const activities = await RegistrationModuleActivity.findAll({
        attributes: ['id','result','in_use','order','activity_id'],
        where: {
            module_id
        },
        order: [
            ['order', 'ASC']
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

function setActivitySkillAndViewMode(formatId, questionAudio, answersAudio) {

    const setSkillNoListening = formatId => {

        let skillId = 0;

        switch (parseInt(formatId)) {
            case 1:
            case 2:
                skillId = 4;
                break;
            case 3:
            case 5:
                skillId = 1;
                break;
            case 4:
            case 6:
            case 7:
                skillId = 2;
                break;
        }

        return skillId;
    }

    let viewMode = 0;
    let skillId = 0;

    if (questionAudio != "0" && answersAudio != "0") {

        const useListening = Math.floor(Math.random() * 1000) + 1;
        if (useListening >= 650) {

            skillId = 3;

            const audioExists = Math.floor(Math.random() * 10) + 1;
            if (audioExists <= 5) {
                viewMode = 1;
            } else {
                viewMode = 2;
            }

        } else {
            skillId = setSkillNoListening(formatId);
        }

    } else {
        skillId = setSkillNoListening(formatId);
    }

    return [skillId,viewMode];
}

module.exports = { getWorkSessionType, getWorkSessionInfo, getWorkSession };