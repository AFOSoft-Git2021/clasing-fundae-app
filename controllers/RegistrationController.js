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

const getItems = (req, res) => {

    const registrations = getAllRegistrations();
    registrations    
        .then(registrations => {            
            res.json(registrations);            
        })
        .catch(error => {
            res.status(400).json({
                 error: error
            })
        });

};

async function getAllRegistrations () {
    const registrations = await Registration.findAll({
        /*include: [{
            model: Course
        }]*/
    });
    return registrations;
}

const getItem = (req, res) => {

    if (req.token) {

        const userId = req.token.user_id;
        const registration = getRegistration(userId);
        registration    
            .then(registration => {            
                
                const mapLoop = async registration => {

                    console.log('Start');

                    let promises;
                    let promises1;
                    let promises2;
                    let promises3;

                    if(registration.length > 0) {

                        const userRegistration = registration[0];
                        const registrationStatus = status => {

                            switch (status) {
                                case 0:
                                    return "in progress";
                                    break;
                                case 1:
                                    return "completed";
                                    break;
                            }

                        }

                        let registrationActivitiesNum = 0;
                        let examObj = new Object();                        
                        examObj.threshold = userRegistration.threshold;
                        examObj.attempts = userRegistration.exam_attempts;
                        examObj.exam1_score = userRegistration.exam1_score;
                        examObj.exam2_score = userRegistration.exam2_score;

                        const course = await getRegistrationCourse(userRegistration.course_id);
                        if (registration.length > 0) {

                            const registrationCourse = course[0];

                            const registrationModules = await getRegistrationModules(userRegistration.id);
                            if (registrationModules.length > 0) {

                                let modulesArray = [];
                                promises = registrationModules.map(async module => {
                                    const registrationModule = await getRegistrationModule(module.id);
                                    let moduleObj = new Object();
                                    moduleObj.name = registrationModule[0].name;
                                    moduleObj.status = registrationModule[0].status;
                                    moduleObj.threshold = registrationModule[0].threshold;
                                    moduleObj.score = registrationModule[0].score;
                                    
                                    const registrationModuleActivities = await getRegistrationModuleActivities(registrationModule[0].id);
                                    moduleObj.num_activities = registrationModuleActivities.length;
                                    registrationActivitiesNum += registrationModuleActivities.length;

                                    const registrationModuleFiles = await getRegistrationModuleFiles(registrationModule[0].id);
                                    if (registrationModuleFiles.length > 0) {                                        
                                        let pillsArray = [];
                                        moduleObj.pills = pillsArray;
                                        promises1 = registrationModuleFiles.map(async file => {
                                            
                                            let pillObj = new Object();
                                            pillObj.id = file.id;
                                            pillObj.name = file.name;
                                            pillObj.viewed = file.viewed;

                                            pillsArray.push(pillObj);

                                            return registrationModuleFiles;
                                        })
                                    } else {
                                        let pillsArray = [];
                                        moduleObj.pills = pillsArray;
                                    }
                                    
                                    modulesArray.push(moduleObj);

                                    return registrationModule;
                                });
                                
                                await Promise.all(promises)
                                .then (async _ => {
                                    if (promises1) {
                                        await Promise.all(promises1)
                                    }
                                })
                                .then (async _ => {                                    

                                    examObj.num_activities = registrationActivitiesNum; 
                                    
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
                                    })
                                    
                                })

                                
                            } else {
                                res.status(400).json({
                                    error: "Registration Modules not found"
                                })    
                            }

                        } else {
                            res.status(400).json({
                                error: "Registration Course not found"
                            })    
                        }   
                    } else {
                        res.status(400).json({
                            error: "Registration not found"
                        })    
                    }

                    console.log('End');
                }

                mapLoop(registration);
            })
            .catch(error => {
                res.status(400).json({
                    error: error
                })
            });
            
    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }

};

async function getRegistration (user_id) {
    const registration = await Registration.findAll({
        attributes: ['id','from_date','to_date','name','threshold','status','exam_attempts','exam1_score','exam2_score','course_id'],
        where: {
            user_id
        }
    });
    return registration;
}

async function getRegistrationCourse (id) {
    const course = await Course.findAll({
        attributes: ['course_code'],
        where: {
            id
        }
    });
    return course;
}

async function getRegistrationModules(registration_id) {

    const registrationModule = await RegistrationModule.findAll({
        attributes: ['id','name','threshold','order','status','score'],
        where: {
            registration_id
        },
        order: [
            ['order', 'ASC'],
        ]
    });

    return registrationModule; 
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

async function getRegistrationModuleActivities(module_id) {
    const moduleActivities = await RegistrationModuleActivity.findAll({
        attributes: ['id'],
        where: {
            module_id
        }
    });

    return moduleActivities;
}

async function getRegistrationModuleFiles (module_id) {
    const moduleFiles = await RegistrationModuleFile.findAll({
        attributes: ['id','name','viewed'],
        where: {
            module_id
        }
    });

    return moduleFiles;
}

module.exports = { getItems, getItem };