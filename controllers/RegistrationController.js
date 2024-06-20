const Registration = require("../models/Registration");
const FundaeTeacher = require("../models/FundaeTeacher");
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
                                    return "exam1";
                                    break;
                                case 2:
                                    return "exam2";
                                    break;
                                case 3:
                                    return "completed ok";
                                    break;
                                case 4:
                                    return "completed ko";
                                    break;
                            }

                        }

                        const teacher = await getRegistrationTeacher(userRegistration.teacher_id);
                        if (teacher.length == 1) {

                            const registrationTeacher = teacher[0];

                            let registrationActivitiesNum = 0;

                            let teacherObj = new Object(); 
                            teacherObj.id = registrationTeacher.id;
                            teacherObj.avatar = registrationTeacher.avatar;
                            teacherObj.name = registrationTeacher.name;
                            teacherObj.availability = registrationTeacher.availability;
                            teacherObj.response_time = registrationTeacher.response_time;
                            teacherObj.messages_number = registrationTeacher.messages_number;

                            let examObj = new Object();                        
                            examObj.threshold = userRegistration.threshold;
                            examObj.attempts = userRegistration.exam_attempts;
                            examObj.exam1_score = userRegistration.exam1_score;
                            examObj.exam2_score = userRegistration.exam2_score;

                            const course = await getRegistrationCourse(userRegistration.course_id);
                            if (course.length > 0) {

                                const registrationCourse = course[0];

                                let numCompletedModules = 0;
                                let numInProgressPillsModules = 0;
                                let numInProgressActivitiesModules = 0;
                                let numNotStartedModules = 0;

                                const registrationModuleStatus = status => {

                                    switch (status) {
                                        case 0:
                                            numNotStartedModules++;
                                            return "not started";
                                            break;
                                        case 1:
                                            numInProgressPillsModules++;
                                            return "in progress (pills)";
                                            break;
                                        case 2:
                                            numInProgressActivitiesModules++;
                                            return "in progress (activities)";
                                            break;
                                        case 3:
                                            numCompletedModules++;
                                            return "completed";
                                            break;
                                    }
        
                                }

                                const registrationModules = await getRegistrationModules(userRegistration.id);
                                if (registrationModules.length > 0) {

                                    let modulesArray = [];
                                    promises = registrationModules.map(async module => {
                                        
                                        const registrationModule = await getRegistrationModule(module.id);
                                        let moduleObj = new Object();
                                        moduleObj.id = registrationModule[0].id;
                                        moduleObj.name = registrationModule[0].name;
                                        moduleObj.description = registrationModule[0].description;
                                        moduleObj.order = registrationModule[0].order;
                                        moduleObj.status = registrationModuleStatus(registrationModule[0].status);
                                        moduleObj.threshold = registrationModule[0].threshold;
                                        moduleObj.score = registrationModule[0].score;
                                        
                                        const registrationModuleActivities = await getRegistrationModuleActivities(registrationModule[0].id);
                                        moduleObj.num_activities = registrationModuleActivities.length;
                                        registrationActivitiesNum += registrationModuleActivities.length;

                                        let correctActivities = 0;
                                        let incorrectActivities = 0;
                                        if (registrationModule[0].status > 1) {
                                            
                                            registrationModuleActivities.forEach (activity => {
                                                
                                                if (activity.result == 1) {
                                                    correctActivities++;
                                                } else {
                                                    if (activity.result == 2) {
                                                        incorrectActivities++;
                                                    }    
                                                }
                                            })
                                        }

                                        moduleObj.num_activities_correct = correctActivities;
                                        moduleObj.num_activities_incorrect = incorrectActivities;
                                        moduleObj.num_activities_still_unanswered = moduleObj.num_activities - (incorrectActivities + correctActivities);

                                        moduleObj.work_session_passed = 0;
                                        if (registrationModule[0].score > 0) {
                                            moduleObj.work_session_passed = (correctActivities >= (registrationModuleActivities.length * (registrationModule[0].threshold / 100))) ? 1 : 0;
                                        }
                                        
                                        const registrationModuleFiles = await getRegistrationModuleFiles(registrationModule[0].id);
                                        const numPills = registrationModuleFiles.length;
                                        let numViewedPills = 0;
                                        let pillsArray = [];
                                        if (registrationModuleFiles.length > 0) {                                        
                                            
                                            promises1 = registrationModuleFiles.map(async file => {
                                                
                                                let pillObj = new Object();
                                                pillObj.id = file.id;
                                                pillObj.name = file.name;
                                                pillObj.viewed = file.viewed;

                                                pillsArray.push(pillObj);

                                                if (file.viewed == 1) {
                                                    numViewedPills++;
                                                }

                                                return registrationModuleFiles;
                                            })
                                        } else {
                                            let pillsArray = [];
                                            
                                        }

                                        moduleObj.num_pills = numPills;
                                        moduleObj.num_pills_viewed = numViewedPills;
                                        moduleObj.num_pills_not_viewed = numPills - numViewedPills;

                                        moduleObj.pills = pillsArray;
                                        
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
                                        
                                        //Ordenamos el array de módulos por el dato "order"
                                        modulesArray.sort((a, b) => parseInt(a.order) - parseInt(b.order));

                                        examObj.num_activities = registrationActivitiesNum; 
                                        
                                        let registrationJSON = {
                                            "course_data": {
                                                "name": `${userRegistration.name}`,
                                                "description": `${userRegistration.description !== null ? userRegistration.description : "" }`,
                                                "from_date": `${userRegistration.from_date}`,
                                                "to_date": `${userRegistration.to_date}`,
                                                "level": registrationCourse.course_code,
                                                "status": registrationStatus(userRegistration.status),     
                                                "num_modules": registrationModules.length,
                                                "num_completed_modules": numCompletedModules,
                                                "num_inprogres_pills_modules": numInProgressPillsModules,
                                                "num_inprogres_activities_modules": numInProgressActivitiesModules,
                                                "num_notstarted_modules": numNotStartedModules
                                            },
                                            "teacher_data": teacherObj,
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
                                error: "Course's teacher not found"
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
                res.status(400).json("error 1")
            });
            
    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }

};

const getTeacherDetails = (req, res) => {

    if (req.token) {

        const userId = req.token.user_id;
        const registration = getRegistration(userId);
        registration    
            .then(async registration => {

                const teacher = await getRegistrationTeacher(registration[0].teacher_id);
                if (teacher.length == 1) {

                    const registrationTeacher = teacher[0];  

                    arraySkills = (registrationTeacher.skills) ? registrationTeacher.skills.split(",") : [];

                    let infoTeacherObj = new Object();
                    infoTeacherObj.title = registrationTeacher.title;
                    infoTeacherObj.description = registrationTeacher.description;
                    infoTeacherObj.skills = arraySkills;

                    let teacherObj = new Object(); 
                    teacherObj.id = registrationTeacher.id;
                    teacherObj.name = registrationTeacher.name;
                    teacherObj.info = infoTeacherObj;
                    teacherObj.avatar = registrationTeacher.avatar;
                    teacherObj.language = registrationTeacher.language;

                    res.status(200).json({
                        status: "ok",
                        code: 200,
                        message: "Teacher found",
                        teacher: teacherObj
                    })

                } else {
                    res.status(400).json({
                        error: "Course's teacher not found"
                    })    
                } 

            })
            .catch(error => {
                res.status(400).json("error 1")
            });
            
    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }

};

async function getAllRegistrations () {
    const registrations = await Registration.findAll({
        /*include: [{
            model: Course
        }]*/
    });
    return registrations;
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

async function getRegistrationTeacher(id) {

    const registration = await FundaeTeacher.findAll({
        attributes: ['id','name','title','availability','response_time','description','avatar','language','skills','messages_number'],
        where: {
            id
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
        attributes: ['id','name','description','threshold','order','status','score'],
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
        attributes: ['id','name','description','threshold','order','status','score'],
        where: {
            id
        }
    });

    return registrationModule; 
}

async function getRegistrationModuleActivities(module_id) {
    const moduleActivities = await RegistrationModuleActivity.findAll({
        attributes: ['id','result'],
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

module.exports = { getItems, getItem, getTeacherDetails };