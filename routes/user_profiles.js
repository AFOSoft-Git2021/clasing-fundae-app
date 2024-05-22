const express = require("express");
const jwt = require("jsonwebtoken");
const { sequelize } = require ("../config/mysql");
const UserProfile = require("../models/UserProfile");
const FundaeCourse = require("../models/FundaeCourse");
const FundaeCourseModule = require("../models/FundaeCourseModule");
const FundaeCourseModuleActivity = require("../models/FundaeCourseModuleActivity");
const FundaeCourseModuleFiles = require("../models/FundaeCourseModuleFiles");
const FundaeCourseExamActivity = require("../models/FundaeCourseExamActivity");
const Registration = require("../models/Registration");
const RegistrationModule = require("../models/RegistrationModule");
const RegistrationModuleActivity = require("../models/RegistrationModuleActivity");
const RegistrationModuleFile = require("../models/RegistrationModuleFile");
const RegistrationExamActivity = require("../models/RegistrationExamActivity");
const File = require("../models/File");
const verifyToken = require("../middlewares/auth");
const route = express.Router();

route.get ('/', verifyToken, (req, res) => {

    const userProfiles = getAllUserProfiles();
    userProfiles    
        .then(users => {            
            res.json(users);
        })
        .catch(error => {
            res.status(400).json(returnJsonError(error));
        });
});

route.post ('/login', (req, res) => {

    let body = req.body;

    console.log(body)

    if (
        body.id && 
        body.firstName && body.lastName && 
        body.email && 
        //body.expirationDate && 
        body.profileType && 
        body.languageLevel
    ) {

        const userProfile = getUserProfile(body.email);
        userProfile
            .then(user => {          
                
                if (/*1==1 ||*/ user.length == 0) {
                    // Register the user, deploy the course and return JWT.

                    let userId = 0;
                    let registrationId = 0;
                    let courseId = 0;

                    const newUserProfile = setUserProfile(body);
                    newUserProfile                        
                    .then (newUser => {
                        userId = newUser.id;
                        const fundaeCourses = findFundaeCourse(newUser.course_id);
                        return fundaeCourses;
                    })
                    .then (courses => {
                        if (courses.length == 1) {
                            courseId = courses[0].id;    
                            let courseName = courses[0].name;
                            let courseThreshold = courses[0].threshold;                             

                            const newRegistration = setRegistration(courseName, courseThreshold, userId, courseId);
                            return newRegistration;
                        } else {
                            res.status(400).json(returnJsonError("Fundae Course not found"));
                        }
                    })
                    .then (registration => {
                        registrationId = registration.id;
                        const courseModules = getFundaeCourseModules(courseId);
                        return courseModules;
                    })
                    .then (modules => {

                        const mapLoop = async _ => {

                            console.log('Start');
                            
                            let promises;
                            let promises1;
                            let promises2;
                            let promises3;
                            let firstTime = true;
                            promises = modules.map(async module => {
                                
                                const newCourseModule = await setRegistrationModule(module, registrationId);                                 
                                
                                const activitiesFundaeCourse = await getFundaeCourseModuleActivities(module.id);
                                if (activitiesFundaeCourse.length > 0) {
                                    promises1 = activitiesFundaeCourse.map(async activity => {
                                        const newCourseModuleActivity = await setRegistrationModuleActivity(newCourseModule.id, activity.activity_id, activity.order);
                                        return newCourseModuleActivity;
                                    })
                                }   
                                
                                const filesFundaeCourse = await getFundaeCourseModuleFiles(module.id);
                                if (filesFundaeCourse.length > 0) {   
                                                                   
                                    promises2 = filesFundaeCourse.map(async file => {
                                        let alternativeName = file.alternative_name;                                        
                                        if (alternativeName === null || alternativeName == "") {
                                            const originalFile = await getFile(file.file_id);
                                            alternativeName = originalFile.length > 0 ? originalFile[0].title : alternativeName;                                            
                                        }
                                        const newCourseModuleFile = await setRegistrationModuleFile(newCourseModule.id, alternativeName, file.order, file.file_id);
                                        return newCourseModuleFile;
                                    })
                                }

                                if (firstTime) {
                                    firstTime = false;
                                    const activitiesExamFundaeCourse = await getFundaeCourseExamActivities(courseId);                                
                                    if (activitiesExamFundaeCourse.length > 0) {
                                        promises3 = activitiesExamFundaeCourse.map(async activity => {
                                            const newCourseExamActivity = await setRegistrationExamActivity(registrationId, activity.activity_id, activity.order);
                                            return newCourseExamActivity;
                                        })
                                    }
                                } 

                                
                                return newCourseModule;                                
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
                                if (promises3) {
                                    await Promise.all(promises3)
                                }
                            })
                            .then ( _ => {
                                const token = jwt.sign({user_id: userId},process.env.JWT_KEY, { expiresIn: 60 * 60 * 24 });
                                res.status(200).json({
                                    status: "ok",
                                    code: 200,
                                    message: "User Registered and logged",
                                    //user: newUser,
                                    jwt: token
                                })

                                console.log('End: ' + token);
                            });

                        }

                        mapLoop();
                        /*.catch(error => {
                            res.status(400).json(returnJsonError(error));
                        });*/
                                                
                    })
                    .catch(error => {
                        res.status(400).json(returnJsonError(error));
                    });

                } else {
                    // Return JWT.
                    console.log ("user_id", user[0].id);
                    const token = jwt.sign({user_id: user[0].id},process.env.JWT_KEY, { expiresIn: 60 * 60 * 24 });
                    res.status(200).json({
                        status: "ok",
                        code: 200,
                        message: "User logged",
                        jwt: token
                    })
                }

                
            })
            .catch(error => {
                res.status(400).json(returnJsonError(error));
            });
    } else {
        res.status(400).json(returnJsonError("Necessary data is missing"));
    }
    
});

/* / */
async function getAllUserProfiles () {
    const userProfiles = await UserProfile.findAll();
    return userProfiles;
}

/* /login */

async function getUserProfile (email) {
    const userProfile = await UserProfile.findAll({
        attributes: ['id','name','email','reseller_user_id'],
        where: {
            email: email,
        }
    });
    return userProfile;
}

async function setUserProfile (body) {

    let type = 0;
    switch (body.profileType) {
        case "BUSINESS":
            type = 1;
            break;
        default:
            type = 0;
            break;
    }

    let course_id = 1;
    let code_course = body.languageLevel;
    switch (body.languageLevel) {
        case "A2":
            course_id = 2;
            break;
        case "B1":
            course_id = 3;
            break;
        case "B2":
            course_id = 4;
            break;
        case "C1":
            course_id = 5;
            break;
        case "C2":
            course_id = 6;
            break;
        default:
            course_id = 1;
            code_course = "A1";
            break;
    }

    const reseller_id = 2;
    const reseller_user_id = body.id;
    const name = body.firstName + " " + body.lastName;
    const email = body.email;
    const subscription_id = 2;
    const offer_name = body.offerName ? body.offerName : null;
    //const expiration_date = null; //body.expirationDate; //TODO: convertir EPOCH Time a TimeStamps

    const jsonData = {
        //expiration_date,
        type,
        status: 1,
        offer_name,
        name,
        email,
        password: "123456",
        number_hours: 1,
        reseller_user_id,
        course_id,
        code_course,
        subscription_id,
        path_id: course_id,
        reseller_id
    };

    const userProfile = await UserProfile.create(jsonData);

    return userProfile;
}

async function findFundaeCourse(course_id) {

    const fundaeCourse = await FundaeCourse.findAll({
        attributes: ['id','name','threshold'],
        where: {
            course_id: course_id,
        }
    });

    return fundaeCourse;    
}

async function setRegistration(name, threshold,user_id, course_id) {

    const from_date = new Date();
    const to_date = new Date(new Date().setMonth(new Date().getMonth() + 1))

    const jsonData = {
        from_date,
        to_date,
        name,
        threshold,
        course_id,
        user_id
    };

    const registration = await Registration.create(jsonData);
    return registration;
}

async function getFundaeCourseModules(course_id) {

    const fundaeCourseModule = await FundaeCourseModule.findAll({
        attributes: ['id','name','threshold','order'],
        where: {
            course_id
        }
    });

    return fundaeCourseModule; 
}

async function setRegistrationModule(courseModule, registrationId) {

    const jsonData = {
        name: courseModule.name,
        threshold: courseModule.threshold,
        order: courseModule.order,
        registration_id: registrationId
    };

    const registrationModule = await RegistrationModule.create(jsonData);
    return registrationModule;
}

function returnJsonError (errorMessage) {
    return {    
        status: "error",
        code: 400,
        message: errorMessage
    }
}

async function getFundaeCourseModuleActivities(module_id) {
    const activitiesFundaeCourseModule = await FundaeCourseModuleActivity.findAll({
        attributes: ['order','activity_id'],
        where: {
            module_id
        }
    });

    return activitiesFundaeCourseModule; 
};

async function setRegistrationModuleActivity(module_id, activity_id, order) {
    const jsonData = {        
        order,
        activity_id,
        module_id
    };

    const registrationModuleActivity = await RegistrationModuleActivity.create(jsonData);
    return registrationModuleActivity;
};

async function getFundaeCourseModuleFiles(module_id) {
    const filesFundaeCourseModule = await FundaeCourseModuleFiles.findAll({
        attributes: ['alternative_name','order','file_id'],
        where: {
            module_id
        }
    });

    return filesFundaeCourseModule; 
};

async function getFile(id) {
    const files = await File.findAll({
        attributes: ['title'],
        where: {
            id
        }
    });

    return files; 
};

async function setRegistrationModuleFile(module_id, name, order, file_id) {
    const jsonData = { 
        name,       
        order,
        file_id,
        module_id
    };

    const registrationModuleActivity = await RegistrationModuleFile.create(jsonData);
    return registrationModuleActivity;
};

async function getFundaeCourseExamActivities(course_id) {
    const activitiesFundaeCourseExam = await FundaeCourseExamActivity.findAll({
        attributes: ['order','activity_id'],
        where: {
            course_id
        }
    });

    return activitiesFundaeCourseExam; 
};

async function setRegistrationExamActivity(registration_id, activity_id, order) {
    const jsonData = {        
        order,
        activity_id,
        registration_id
    };

    const registrationExamActivity = await RegistrationExamActivity.create(jsonData);
    return registrationExamActivity;
};

module.exports = route;

