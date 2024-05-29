const RegistrationModuleActivity = require("../models/RegistrationModuleActivity");
const ActivityQuestion = require("../models/ActivityQuestion");
const ActivityQuestionAnswer = require("../models/ActivityQuestionAnswer");

/*
* @param {*} req  
*/

const getWorkSession = (req, res) => {

    if (req.token) {

        const moduleId = req.params.module_id;
        
        //TODO: ReferenceError: getRegistrationModuleActivities is not defined
        const activities = getRegistrationModuleActivities(moduleId);
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
                            
                            const activityQuestions = await getActivityQuestions(activity.activity_id);
                            if (activityQuestions.length == 1) { 

                                promises1 = activityQuestions.map(async activityQuestion => {

                                    const activityQuestionsAnswers = await getActivityQuestionsAnswers(activityQuestion.id);
                                    if (activityQuestionsAnswers.length > 0) {
                                        let newActivity = new Object();
                                        newActivity.id = activityQuestion.activity_id;
                                        newActivity.question = activityQuestion.question;

                                        activitiesArray.push(newActivity);
                                    } 

                                    return activityQuestionsAnswers;

                                });
                            }
                            
                            return activityQuestions;
                        });
                        
                        await Promise.all(promises)
                        .then (async _ => {
                            if (promises1) {
                                await Promise.all(promises1)
                            }
                        })
                        .then (async _ => {                                    

                            //examObj.num_activities = registrationActivitiesNum;   

                            res.status(200).json({
                                status: "ok",
                                code: 200,
                                message: "Work Session recover successfully",
                                registration: activitiesArray
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
            error: "JWT must be provided"
        })
    }

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

module.exports = { getWorkSession };