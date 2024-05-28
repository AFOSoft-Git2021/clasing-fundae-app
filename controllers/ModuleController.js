const Registration = require("../models/Registration");
const RegistrationModule = require("../models/RegistrationModule");
const RegistrationModuleActivity = require("../models/RegistrationModuleActivity");
const RegistrationModuleFile = require("../models/RegistrationModuleFile");
const File = require("../models/File");
const FundaeCourse = require("../models/FundaeCourse");
const Course = require("../models/Course");

/*
* @param {*} req  
*/

const getWorkSession = (req, res) => {

    if (req.token) {

        const moduleId = req.params.module_id;
        
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

                        let modulesArray = [];
                        promises = activities.map(async activity => {
                            
                            const activityQuestions = await getActivityQuestions(activity.activity_id);
                            if (activityQuestions.length == 1) { 

                                promises1 = activityQuestions.map(async activityQuestion => {

                                    const activityQuestionsAnswers = await getActivityQuestionsAnswers(activityQuestion.id);
                                    if (activityQuestionsAnswers.length > 0) {
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

                            /*examObj.num_activities = registrationActivitiesNum; 
                            
                            let registrationJSON = {
                                "course_data": {
                                    "name": `${userRegistration.name}`,
                                    "from_date": `${userRegistration.from_date}`,
                                    "to_date": `${userRegistration.to_date}`,
                                    "level": registrationCourse.course_code,
                                    "status": registrationStatus(userRegistration.status),                                       
                                },
                                "modules_data": modulesArray,
                                "exam_data": examObj
                            }

                            res.status(200).json({
                                status: "ok",
                                code: 200,
                                message: "Registration found: " + userRegistration.id,
                                registration: registrationJSON
                            })*/
                            
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

        
        /*pills    
            .then(pills => {   
    
                // read file asynchronously
                fs.readFile("./storage/files/" + pills[0].code + ".html", "utf8", (err, data) => {
                    if (!err) {

                        let html = data.replace(/\r\n/gi,'').replace(/border="1"/gi,' cellspacing="20"').replace(/<table /gi,'<table style="width:100%"');
                        html.replace(/<table/gi,'<table style="width:100%"');

                        let pages = [];
                        let noBody = html.split("<body>");
                        if (noBody.length == 2) {
                            noBody = noBody[1].split("</body>");
                            if (noBody.length == 2) {
                                const styleCSS = "<style>.file_wrapper{background-color:#004175;color:white;font:16px 'Montserrat',sans-serif;line-height:1.4em}.file_wrapper ul{list-style:disc !important;margin:0 0 0 1em !important;padding:0 0 0 1em !important}.file_wrapper ul>ul{list-style:circle !important}.file_wrapper ul>ul>li:last-child{padding-bottom:1em !important}.file_wrapper h1,.file_wrapper h2,.file_wrapper h3,.file_wrapper h4,.file_wrapper p{margin:14px 0 !important}.file_wrapper table{border-collapse:collapse;border:1px solid;width:100%}.file_wrapper table td{border:1px solid;color:white;padding:2.25em}</style>";
                                pages = noBody[0].split('<div class="-break"></div>');
                                for (let i=0; i<data.length;i++) {
                                    pages[i] = styleCSS + pages[i];
                                }                                
                            }
                        } 

                        res.status(200).json(pages);

                    } else {
                        res.status(400).json({
                            error: err
                        })
                    }
                });

            })
            .catch(error => {
                res.status(400).json({
                    error: "File identificator not found"
            })
        });*/
            
    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }

}

async function getRegistrationModuleActivities(module_id) {
    const moduleActivities = await RegistrationModuleActivity.findAll({
        attributes: ['activity_id','result','in_use','order'],
        where: {
            module_id
        }
    });

    return moduleActivities;
}

module.exports = { getWorkSession };