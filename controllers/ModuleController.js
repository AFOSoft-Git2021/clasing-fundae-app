const RegistrationModule = require("../models/RegistrationModule");
const RegistrationModuleActivity = require("../models/RegistrationModuleActivity");
const RegistrationModuleExamActivity = require("../models/RegistrationModuleExamActivity");
const RegistrationModuleWorkSession = require("../models/RegistrationModuleWorkSession");
const RegistrationModuleExamWorkSession = require("../models/RegistrationModuleExamWorkSession");
const Activity = require("../models/Activity");
const ActivityFormat = require("../models/ActivityFormat");
const ActivityQuestion = require("../models/ActivityQuestion");
const ActivityQuestionAnswer = require("../models/ActivityQuestionAnswer");
const Skill = require("../models/Skill");
const fs = require('fs').promises;
const jwt = require("jsonwebtoken"); 

const { Op } = require('sequelize');

/*
* @param {*} req  
*/

const unwrapToken = (req, res) => {

    if (req.token) {

        /*if (
            req.token.wstype && 
            req.token.wsid && 
            req.token.wsreset 
        ) {*/
            
            const wstype = req.token.wstype;                
            const wsid = req.token.wsid;
            const wsreset = req.token.wsreset;

            res.status(200).json({
                status: "ok",
                code: 200,
                message: "Token unwrapped successfully",
                wstype : wstype,
                wsid : wsid,
                wsreset : wsreset
            })                

        /*}else {
            res.status(400).json({error:req.token});
        } */

    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }

}

const getWorkSessionType = (req, res) => {

    if (req.token) {

        const workSessionId = req.token.worksession_id;
        const workSessionType = req.token.worksession_type;
        if (workSessionType == 0 || workSessionType == 5) {

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
                worksession_type: workSessionType,
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

        const workSessionType = req.token.wstype;
        if (workSessionType && (workSessionType == 0 || workSessionType == 5)) {

            const workSessionId = req.params.id;

            if (workSessionId) {

                let workSessionInfo = new Object();

                const registrationModule = getRegistrationModule(workSessionId);
                registrationModule
                .then(registrationModule => {

                    workSessionInfo.name = registrationModule[0].name;
                    workSessionInfo.threshold = (workSessionType == 0) ? registrationModule[0].threshold : registrationModule[0].threshold;

                    const activities = (workSessionType == 0) ? getRegistrationModuleActivities(workSessionId) : getRegistrationModuleExamActivities(workSessionId);
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

                    const token = jwt.sign({user_id: req.token.user_id, worksession_type:workSessionType, worksession_id:workSessionId},process.env.JWT_KEY, { expiresIn: 60 * 60 * 24 });

                    res.status(200).json({
                        status: "ok",
                        code: 200,
                        message: (workSessionType == 0) ? "Work Session Info recovered successfully" : "Module Exam Info recovered successfully",
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
                error: "Work session type not found"
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
        const workSessionType = req.token.worksession_type;

        if (workSessionId && workSessionType && (workSessionType == 0 || workSessionType == 5)) {            
            
            let numActivities = 0;
            const moduleActivities = (workSessionType == 0) ? getRegistrationModuleActivities(workSessionId) : getRegistrationModuleExamActivities(workSessionId);
            moduleActivities    
                .then(async moduleActivities => {   

                    console.log("START");

                    //Ordenamos el array manualmente por QUE NO ME FUNCIONA EL SORT SEQUELIZE
                    //moduleActivities.sort((a, b) => parseInt(a.order) - parseInt(b.order));

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
                                                newActivity.id = moduleActivity.id;
                                                newActivity.description = activityFormats[0].description;
                                                newActivity.activity_id = activity.id;
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
                                                    //html = await fs.readFile("./storage/texts/" + activityQuestion.text + ".html", "utf8");
                                                    //html = await fs.readFile(process.env.CLASING_STORAGE + "texts/" + activityQuestion.text + ".html", "utf8");  
                                                    //html = await fetch(process.env.CLASING_STORAGE + "texts/" + activityQuestion.text + ".html");


                                                    
                                                    // *****

                                                    

                                                    await fetch(process.env.CLASING_STORAGE + "texts/" + activityQuestion.text + ".html")
                                                    .then(async response => await response.text())
                                                    .then(html => {

                                                        const html1 = html.split("<h3")[0];
                                                        const html2 = html.split("h3>")[1];

                                                        newActivity.text = html1 + html2;
                                                        activitiesArray.push(newActivity);
                                                    })
                                                    .catch(error => {
                                                        res.status(400).json({
                                                            error: error
                                                        })
                                                    })

                                                    // *******
                                                    //activitiesArray.push(newActivity);

                                                   

                                                    
                                                
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

const setWorkSessionActivityResponse = (req, res) => {

    if (req.token) {

        if (req.token.worksession_id && req.token.worksession_type && (req.token.worksession_type == 0 || req.token.worksession_type == 5)) {

            if (
                req.body.id && 
                req.body.result && 
                req.body.skill_id && 
                req.body.order 
            ) {
                
                const moduleId = req.token.worksession_id;                
                const id = req.body.id;
                const result = req.body.result;
                const skillId = req.body.skill_id;
                const order = req.body.order;

                const workSessionType = req.token.worksession_type;

                const activityResponse = (workSessionType == 0) ? setActivityResponse(id, result, skillId) : setExamActivityResponse(id, result, skillId);
                activityResponse
                .then (async _ => {

                    res.status(200).json({
                        status: "ok",
                        code: 200,
                        message: "Activity result and saved successfully"
                    })
                })
                .catch (error => {
                    res.status(400).json({"error":"Error saving activity result"});
                })

            } else {
                res.status(400).json({"error":"Necessary data is missing"});
            }

        } else {
            res.status(400).json({"error":"Module Registration Id not found"});
        }

    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }
}

const getWorkSessionStatistics = (req, res) => {

    if (req.token) {
        
        if (req.token.worksession_id && req.token.worksession_type && (req.token.worksession_type == 0 || req.token.worksession_type == 5)) {

            const workSessionId = req.token.worksession_id;
            const workSessionType = req.token.worksession_type;

            console.log("START");

            const registrationModule = getRegistrationModule(workSessionId);
            registrationModule
            .then (registrationModule => {

                const moduleWorkSessions = (workSessionType == 0) ? getModuleWorkSessions(workSessionId) : getModuleExamWorkSessions(workSessionId);
                moduleWorkSessions
                .then (moduleWorkSessions => { 
            
                    const skills = getSkills();
                    skills
                    .then (skills => {

                        let skillsArray = [];
                        skills.forEach(skill => {
                            let skillObject = new Object();
                            skillObject.id = skill.id;
                            skillObject.name = skill.name;
                            skillObject.numberCorrectActivities = 0;
                            skillObject.numberIncorrectActivities = 0;
                            skillObject.percentage = 0;
                            skillsArray.push(skillObject);
                        });

                        const activities = (workSessionType == 0) ? getRegistrationModuleActivities(workSessionId) : getRegistrationModuleExamActivities(workSessionId);
                        activities
                        .then (activities => {

                            let activitiesCorrectNumber = 0;
                            let activitiesIncorrectNumber = 0;

                            activities.forEach (activity => {
                                for (let skill of skillsArray) {
                                    if (skill.id == activity.skill_id) {
                                        if (activity.result == 1) {
                                            skill.numberCorrectActivities++;
                                            activitiesCorrectNumber++;
                                        } else {
                                            if (activity.result == 2) {
                                                skill.numberIncorrectActivities++;
                                                activitiesIncorrectNumber++;
                                            }
                                        }
                                        break;
                                    }
                                }
                            });

                            const workSessionNumActivities = activitiesCorrectNumber + activitiesIncorrectNumber;
                            const threshold = (workSessionType == 0) ? registrationModule[0].threshold : registrationModule[0].threshold_exam;
                            const moduleName = registrationModule[0].name;

                            for (let skill of skillsArray) {
                                skill.percentage = ((skill.numberCorrectActivities + skill.numberIncorrectActivities) > 0) ? (100 * skill.numberCorrectActivities) / (skill.numberCorrectActivities + skill.numberIncorrectActivities) : 0;

                                skill.percentage = Math.trunc(skill.percentage*100)/100;
                            }

                            const passedWorkSession = (activitiesCorrectNumber >= (workSessionNumActivities * (threshold / 100))) ? 1 : 0;

                            // Update module

                            let newModuleStatus = (workSessionType == 0) ? ((registrationModule[0].module_exam_completed == 1) ? 3 : 2) : ((registrationModule[0].work_session_completed == 1) ? 3 : 2);

                            const updatedRegistrationModule = (workSessionType == 0) ? updateRegistrationModuleScoreAndSetCompleted(workSessionId, activitiesCorrectNumber, newModuleStatus) : updateRegistrationExamModuleScoreAndSetCompleted(workSessionId, activitiesCorrectNumber, newModuleStatus);
                            updatedRegistrationModule
                            .then (_ => {

                                const statistics = {
                                    "name": moduleName,
                                    "attempts": moduleWorkSessions.length,
                                    "passed": passedWorkSession,
                                    "correct_activities": activitiesCorrectNumber,
                                    "incorrect_activities": activitiesIncorrectNumber, 
                                    "skills": skillsArray
                                };

                                // Saving Work Session info
                                const registrationModuleWorkSession = (workSessionType == 0) ? setModuleWorkSession(workSessionId, activitiesCorrectNumber, JSON.stringify(statistics)) : setModuleExamn(workSessionId, activitiesCorrectNumber, JSON.stringify(statistics));
                                registrationModuleWorkSession
                                .then (_ => {

                                    res.status(200).json({
                                        status: "ok",
                                        code: 200,
                                        message: "Work Session statistic and module score generated and saved sucessfully",
                                        statistics: statistics,
                                        newModuleStatus,
                                        workSessionType,
                                        work_session_completed: registrationModule[0].work_session_completed,
                                        module_exam_completed: registrationModule[0].module_exam_completed
                                    })

                                    console.log("END");
                                })
                                .catch (error => {
                                    res.status(400).json({"error":"Error recording Work Session info"});
                                })
                            })
                            .catch (error => {
                                res.status(400).json({"error":"Error updating module score"});
                            })
                        })
                        .catch (error => {
                            res.status(400).json({"error":"Error recovering work session activities"});
                        })
                    })
                    .catch (error => {
                        res.status(400).json({"error":"Error recovering list of skills"});
                    })
                })
                .catch (error => {
                    res.status(400).json({"error":"Error recovering works sessions attempts"});
                })
            })
            .catch (error => {
                res.status(400).json({"error":"Error recovering Module Registration data"});
            })

        } else {
            res.status(400).json({"error":"Module Registration Id not found"});
        }

    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }
}

const initWorkSession = (req, res) => {

    if (req.token) {

        const workSessionType = req.token.wstype;
        if (workSessionType && (workSessionType == 0 || workSessionType == 5)) {

            if (req.params.id)  {

                const workSessionId = req.params.id;

                if (workSessionId) {

                    console.log("START");

                    const registrationModuleActivities =  (workSessionType == 0) ? updateRegistrationModuleStatusAndScore(workSessionId, 2) : updateRegistrationModuleExamStatusAndScore(workSessionId, 2);
                    if (registrationModuleActivities) {

                        res.status(200).json({
                            status: "ok",
                            code: 200,
                            message: "Module status initiated successfully"
                        })

                        console.log("END");
                    } else {
                        res.status(400).json({"error":"Error changing module status"});
                    }

                } else {
                    res.status(400).json({
                        error: "Work Session Id not found"
                    })
                }
            } else {
                res.status(400).json({
                    error: "Neccesary Data not found"
                })
            }
        } else {
            res.status(400).json({
                error: "Work session type not found: " + workSessionType
            })
        }
            
    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }

}

const resetWorkSession = (req, res) => {

    if (req.token) {

        //const workSessionType = req.token.worksession_type;
        const workSessionType = (req.token.wstype) ? req.token.wstype : req.token.worksession_type;
        if (workSessionType && (workSessionType == 0 || workSessionType == 5)) {

            if (req.params.id)  {

                let workSessionId = 0;

                if (parseInt(req.params.id) > 0)  {
                    workSessionId = req.params.id;
                } else {
                    workSessionId = (req.token.wsid) ? req.token.wsid : req.token.worksession_id;
                }

                if (workSessionId) {

                    const registrationModule = (workSessionType == 0) ? InitializeRegistrationModuleActivities(workSessionId) : InitializeRegistrationModuleExamActivities(workSessionId);
                    registrationModule.then(async _ => {
                        
                        const registrationModuleActivities = (workSessionType == 0) ? await updateRegistrationModuleStatusAndScore(workSessionId, 2) : await updateRegistrationModuleExamStatusAndScore(workSessionId, 2);
                        if (registrationModuleActivities) {

                            res.status(200).json({
                                status: "ok",
                                code: 200,
                                message: "Work Session and module status reset successfully"
                            })

                            console.log("END");
                        } else {
                            res.status(400).json({"error":"Error changing module status"});
                        }

                    })
                    .catch (error => {
                        res.status(400).json({"error":"Error recovering works essions attempts"});
                    })

                } else {
                    res.status(400).json({
                        error: "JWT not contains WorkSession Data"
                    })
                }
            } else {
                res.status(400).json({
                    error: "Neccesary Data not founf"
                })
            }

        } else {
            res.status(400).json({
                error: "Work session type not found"
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
        attributes: ['id','name','threshold','threshold_exam','order','status','score','score_exam','work_session_completed','module_exam_completed'],
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
        attributes: ['id','result','in_use','order','skill_id','activity_id'],
        where: {
            module_id
        },
        order: [
            ['order', 'ASC']
        ],
        
    });

    return activities;
}

async function getRegistrationModuleExamActivities(module_id) {

    const activities = await RegistrationModuleExamActivity.findAll({
        attributes: ['id','result','in_use','order','skill_id','activity_id'],
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

async function setActivityResponse(id, result, skill_id) {
    const jsonData = {        
        result,
        in_use: 1,
        skill_id
    };

    const jsonWhere = {        
        id
    };

    const ativityResponse = await RegistrationModuleActivity.update(
        jsonData,
        {
            where: jsonWhere
        }
    );
    return ativityResponse;
};

async function setExamActivityResponse(id, result, skill_id) {
    const jsonData = {        
        result,
        in_use: 1,
        skill_id
    };

    const jsonWhere = {        
        id
    };

    const ativityResponse = await RegistrationModuleExamActivity.update(
        jsonData,
        {
            where: jsonWhere
        }
    );
    return ativityResponse;
};

async function getSkills() {

    const skills = await Skill.findAll({
        attributes: ['id','name','abbreviation'],
        order: [
            ['id', 'ASC']
        ]
    });

    return skills;

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

async function InitializeRegistrationModuleActivities(module_id) {

    const jsonData = {                
        result: 0,
        skill_id: 1,
        in_use: 0
    };

    const jsonWhere = {        
        module_id
        //order: {[DataTypes.gt]:1} //order > 1
    };

    const registrationModuleActivities = await RegistrationModuleActivity.update(
        jsonData,
        {
            where: jsonWhere
        }
    );

    return registrationModuleActivities;
}

async function InitializeRegistrationModuleExamActivities(module_id) {

    const jsonData = {                
        result: 0,
        skill_id: 1,
        in_use: 0
    };

    const jsonWhere = {        
        module_id,
        //order: {[DataTypes.gt]:1} //order > 1
    };

    const registrationModuleActivities = await RegistrationModuleExamActivity.update(
        jsonData,
        {
            where: jsonWhere
        }
    );

    return registrationModuleActivities;
}

async function updateRegistrationModuleStatusAndScore(id, status) {

    const jsonData = {        
        status,
        score: 0,
        work_session_completed: 0
    };

    const jsonWhere = {        
        id
    };

    const moduleResponse = await RegistrationModule.update(
        jsonData,
        {
            where: jsonWhere
        }
    );
    return moduleResponse;
};

async function updateRegistrationModuleExamStatusAndScore(id, status) {

    const jsonData = {        
        status,
        score_exam: 0,
        module_exam_completed: 0
    };

    const jsonWhere = {        
        id
    };

    const moduleResponse = await RegistrationModule.update(
        jsonData,
        {
            where: jsonWhere
        }
    );
    return moduleResponse;
};

async function updateRegistrationModuleScoreAndSetCompleted(id, score, status) {

    const jsonData = {        
        score,
        status,
        work_session_completed: 1
    };

    const jsonWhere = {        
        id
    };

    const moduleResponse = await RegistrationModule.update(
        jsonData,
        {
            where: jsonWhere
        }
    );
    return moduleResponse;
};

async function updateRegistrationExamModuleScoreAndSetCompleted(id, score_exam, status) {

    const jsonData = {        
        score_exam,
        status,
        module_exam_completed: 1
    };

    const jsonWhere = {        
        id
    };

    const moduleResponse = await RegistrationModule.update(
        jsonData,
        {
            where: jsonWhere
        }
    );
    return moduleResponse;
};

async function setModuleWorkSession(module_id, score, json_data) {
    const jsonData = { 
        score,       
        json_data,
        module_id
    };

    const registrationModuleWorkSession = await RegistrationModuleWorkSession.create(jsonData);
    return registrationModuleWorkSession;
};

async function setModuleExamn(module_id, score, json_data) {
    const jsonData = { 
        score,       
        json_data,
        module_id
    };

    const registrationModuleWorkSession = await RegistrationModuleExamWorkSession.create(jsonData);
    return registrationModuleWorkSession;
};

async function getModuleWorkSessions(module_id) {
    const workSessions = await RegistrationModuleWorkSession.findAll({
        attributes: ['id'],
        where: {
            module_id
        }
    });

    return workSessions;
};

async function getModuleExamWorkSessions(module_id) {
    const workSessions = await RegistrationModuleExamWorkSession.findAll({
        attributes: ['id'],
        where: {
            module_id
        }
    });

    return workSessions;
};

module.exports = { unwrapToken, getWorkSessionType, getWorkSessionInfo, getWorkSession, setWorkSessionActivityResponse, getWorkSessionStatistics, initWorkSession, resetWorkSession };