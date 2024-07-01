const Registration = require("../models/Registration");
const RegistrationExamActivity = require("../models/RegistrationExamActivity");
const Activity = require("../models/Activity");
const ActivityFormat = require("../models/ActivityFormat");
const ActivityQuestion = require("../models/ActivityQuestion");
const ActivityQuestionAnswer = require("../models/ActivityQuestionAnswer");
const Skill = require("../models/Skill");
const fs = require('fs').promises;
const jwt = require("jsonwebtoken"); 

/*
* @param {*} req  
*/

const getExamInfo = (req, res) => {

    if (req.token) {

        const workSessionId = req.params.id;

        if (workSessionId) {

            let examInfo = new Object();

            const registration = getRegistrationbyId(workSessionId);
            registration
            .then (registration => { 

                examInfo.name = registration[0].name;
                examInfo.threshold = registration[0].threshold;

                const activities = getRegistrationExamActivities(workSessionId);
                activities
                .then(activities => {

                    console.log("workSessionId: ", workSessionId);
                    
                    examInfo.num_activities = activities.length;
                    let examInitiated = false;
                    activities.forEach (activity => {
                        if (activity.result > 0) {
                            examInitiated = true;
                        }
                    }); 

                    examInfo.status = examInitiated ? 1 : 0;

                    const token = jwt.sign({user_id: req.token.user_id, worksession_type:1, worksession_id:workSessionId},process.env.JWT_KEY, { expiresIn: 60 * 60 * 24 });

                    res.status(200).json({
                        status: "ok",
                        code: 200,
                        message: "Exam Info recovered successfully",
                        exam_info: examInfo,
                        jwt: token
                    })
                })
                .catch(error => {
                    res.status(400).json({
                        error: error
                    })
                })
            })
            .catch(error => {
                res.status(400).json({
                    error: error
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

const getExam = (req, res) => {

    if (req.token) {

        const workSessionId = req.token.worksession_id;

        if (workSessionId) {            
            
            let numActivities = 0;
            const examActivities = getRegistrationExamActivities(workSessionId);
            examActivities    
                .then(async examActivities => {   

                    console.log("START");

                    let activitiesArray = [];

                    for (const moduleActivity of examActivities) {
                        
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
                                                    html = await fs.readFile(process.env.CLASING_STORAGE + "texts/" + activityQuestion.text + ".html", "utf8");
                                                            
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
                        message: "Exam recovered successfully",
                        
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
                error: "JWT not contains Exam Data"
            })
        }
            
    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }

}

const setExamActivityResponse = (req, res) => {

    if (req.token) {

        if (req.token.worksession_id && req.token.user_id) {

            if (
                req.body.id && 
                req.body.result && 
                req.body.skill_id && 
                req.body.order 
            ) {
                
                const user_id = req.token.user_id;
                const registrationId = req.token.worksession_id;                
                const id = req.body.id;
                const result = req.body.result;
                const skillId = req.body.skill_id;
                const order = req.body.order;

                const registration = getRegistration(user_id);
                registration
                .then (registration => { 

                    if(registration.length > 0) {

                        registration = registration[0];

                        const activityResponse = setActivityResponse(id, result, skillId);
                        activityResponse
                        .then (async _ => {

                            if (parseInt(order) == 1) {

                                const examAttempts = registration.exam_attempts + 1;
                                console.log("Attempts: ", examAttempts);

                                const registrationModule = await updateRegistrationExamStatusAndAttempt(registrationId, examAttempts);
                                if (registrationModule) {
                                    res.status(200).json({
                                        status: "ok",
                                        code: 200,
                                        message: "Activity result, Exam status and attempt number saved successfully"
                                    })
                                } else {
                                    res.status(400).json({"error":"Error changing registration data"});
                                }

                            } else {
                                res.status(200).json({
                                    status: "ok",
                                    code: 200,
                                    message: "Activity result saved successfully"
                                })
                            }
                            
                        })
                        .catch (error => {
                            res.status(400).json({"error":"Error saving activity result"});
                        })
                    } else {
                        res.status(400).json({
                            error: "Registration not found" + user_id
                        })
                    }
                })
                .catch (error => {
                    res.status(400).json({"error":"Error reading registration data"});
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

const getExamStatistics = (req, res) => {

    if (req.token) {

        if (req.token.worksession_id && req.token.user_id) {

            const user_id = req.token.user_id;
            const workSessionId = req.token.worksession_id;

            console.log("START");

            const registration = getRegistration(user_id);
            registration
            .then (registration => {
            
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

                    const activities = getRegistrationExamActivities(workSessionId);
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

                        const examNumActivities = activitiesCorrectNumber + activitiesIncorrectNumber;
                        const threshold = registration[0].threshold;
                        const courseName = registration[0].name;
                        const attempts = registration[0].exam_attempts;
                        const registrationId = registration[0].id;

                        for (let skill of skillsArray) {
                            skill.percentage = ((skill.numberCorrectActivities + skill.numberIncorrectActivities) > 0) ? (100 * skill.numberCorrectActivities) / (skill.numberCorrectActivities + skill.numberIncorrectActivities) : 0;

                            skill.percentage = Math.trunc(skill.percentage*100)/100;
                        }

                        const passedExam = (activitiesCorrectNumber >= (examNumActivities * (threshold / 100))) ? 1 : 0;
                        const statistics = {
                            "name": courseName,
                            "passed": passedExam,
                            "attempts": attempts,
                            "correct_activities": activitiesCorrectNumber,
                            "incorrect_activities": activitiesIncorrectNumber, 
                            "skills": skillsArray
                        };
                        
                        // Update exam and course data
                        const updatedRegistration = updateRegistrationExamScoreStatisticsAndSetCompeted(registrationId, activitiesCorrectNumber, attempts, passedExam, JSON.stringify(statistics));
                        updatedRegistration
                        .then (_ => {

                            if (passedExam == 1) {

                                res.status(200).json({
                                    status: "ok",
                                    code: 200,
                                    message: "Exam statistic, attempts and score generated and saved sucessfully",
                                    statistics: statistics
                                })
                            } else {
                                // Reset exam activities
                                const updatedRegistration = InitializeRegistrationExamActivities(registrationId);
                                updatedRegistration
                                .then (_ => {
                                    res.status(200).json({
                                        status: "ok",
                                        code: 200,
                                        message: "Exam statistic, attempts and score generated and saved sucessfully",
                                        statistics: statistics
                                    })
                                })
                                .catch (error => {
                                    res.status(400).json({"error":"Error recording Work Session info"});
                                })
                            }

                            console.log("END");
                        })
                        .catch (error => {
                            res.status(400).json({"error":"Error recording Work Session info"});
                        })
                    })    
                    .catch (error => {
                        res.status(400).json({"error":"Error recovering exam activities"});
                    })
                })
                .catch (error => {
                    res.status(400).json({"error":"Error recovering list of skills"});
                })
            })
            .catch (error => {
                res.status(400).json({"error":"Error recovering Exam data"});
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

async function getRegistration (user_id) {
    
    const registration = await Registration.findAll({
        attributes: ['id','from_date','to_date','name','description','threshold','status','exam_attempts','exam1_score','exam2_score','course_id','teacher_id'],
        where: {
            user_id
        }
    });
    
    return registration;
}

async function getRegistrationbyId (id) {
    
    const registration = await Registration.findAll({
        attributes: ['id','from_date','to_date','name','description','threshold','status','exam_attempts','exam1_score','exam2_score','course_id','teacher_id'],
        where: {
            id
        }
    });
    
    return registration;
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

async function getRegistrationExamActivities(registration_id) {

    const activities = await RegistrationExamActivity.findAll({
        attributes: ['id','result','in_use','order','skill_id','activity_id'],
        where: {
            registration_id
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

    const ativityResponse = await RegistrationExamActivity.update(
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

async function updateRegistrationExamStatusAndAttempt(id, exam_attempts) {

    const jsonData = {        
        status: exam_attempts,
        exam_attempts
    };

    const jsonWhere = {        
        id
    };

    const moduleResponse = await Registration.update(
        jsonData,
        {
            where: jsonWhere
        }
    );
    return moduleResponse;
};

async function updateRegistrationExamScoreStatisticsAndSetCompeted (id, score, attempts, passedExam, statistics) {

    let jsonData = new Object();
    //jsonData.exam_attempts = attempts + 1;   

    if (attempts == 1) {
        jsonData.exam1_score = score;
        jsonData.exam1_json_data = statistics;
        if (passedExam == 0) {
            jsonData.status = 2;
        } else {
            jsonData.status = 3;
        }
    } else {
        jsonData.exam2_score = score;
        jsonData.exam2_json_data = statistics;
        if (passedExam == 0) {
            jsonData.status = 4;
        } else {
            jsonData.status = 3;
        }
    }

    const jsonWhere = {        
        id
    };

    const moduleResponse = await Registration.update(
        jsonData,
        {
            where: jsonWhere
        }
    );
    return moduleResponse;
};

async function InitializeRegistrationExamActivities(registration_id) {

    const jsonData = {                
        result: 0,
        skill_id: 1,
        in_use: 0
    };

    const jsonWhere = {        
        registration_id
    };

    const registrationModuleActivities = await RegistrationExamActivity.update(
        jsonData,
        {
            where: jsonWhere
        }
    );

    return registrationModuleActivities;
}

async function setModuleWorkSession(module_id, score, json_data) {
    const jsonData = { 
        score,       
        json_data,
        module_id
    };

    const registrationModuleWorkSession = await RegistrationModuleWorkSession.create(jsonData);
    return registrationModuleWorkSession;
};

module.exports = { getExamInfo , getExam, setExamActivityResponse, getExamStatistics };