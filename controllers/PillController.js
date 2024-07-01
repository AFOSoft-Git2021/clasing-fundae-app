const Registration = require("../models/Registration");
const File = require("../models/File");
const fs = require("fs");
const RegistrationModule = require("../models/RegistrationModule");
const RegistrationModuleFile = require("../models/RegistrationModuleFile");

/*
* @param {*} req  
*/

const getItem_BAK = (req, res) => {

    if (req.token) {

        const pillId = req.params.id;
        
        const pills = getFile(pillId);
        pills    
            .then(pills => {   
    
                // read file asynchronously
                fs.readFile("./storage/files/" + pills[0].code + ".html", "utf8", (err, data) => {
                    if (!err) {

                        let html = data.replace(/\r\n/gi,'').replace(/\t/gi,'').replace(/border="1"/gi,' cellspacing="20"').replace(/<table /gi,'<table style="width:100%"');
                        html.replace(/<table/gi,'<table style="width:100%"');

                        let pages = [];
                        let noBody = html.split("<body>");
                        if (noBody.length == 2) {
                            noBody = noBody[1].split("</body>");
                            if (noBody.length == 2) {
                                const styleCSS = ""; //"<style>.file_wrapper{background-color:#004175;color:white;font:16px 'Montserrat',sans-serif;line-height:1.4em}.file_wrapper ul{list-style:disc !important;margin:0 0 0 1em !important;padding:0 0 0 1em !important}.file_wrapper ul>ul{list-style:circle !important}.file_wrapper ul>ul>li:last-child{padding-bottom:1em !important}.file_wrapper h1,.file_wrapper h2,.file_wrapper h3,.file_wrapper h4,.file_wrapper p{margin:14px 0 !important}.file_wrapper table{border-collapse:collapse;border:1px solid;width:100%}.file_wrapper table td{border:1px solid;color:white;padding:2.25em}</style>";
                                pages = noBody[0].split('<div class="-break"></div>');
                                for (let i=0; i<pages.length;i++) {
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
        });
            
    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }

};

const getItem = (req, res) => {

    if (req.token) {

        const pillId = req.params.id;

        const file = getRegistrationModuleFile(pillId);
        file
            .then(file => {  
        
                const pills = getFile(file[0].file_id);
                pills    
                    .then(pills => {   
            
                        // read file asynchronously
                        //fs.readFile("./storage/files/" + pills[0].code + ".html", "utf8", (err, data) => {
                        fs.readFile(process.env.CLASING_STORAGE + "files/" + pills[0].code + ".html", "utf8", (err, data) => {
                            if (!err) {

                                let html = data.replace(/\r\n/gi,'').replace(/\t/gi,'').replace(/border="1"/gi,' cellspacing="20"').replace(/<table /gi,'<table style="width:100%"');
                                html.replace(/<table/gi,'<table style="width:100%"');

                                let pages = [];
                                let noBody = html.split("<body>");
                                if (noBody.length == 2) {
                                    noBody = noBody[1].split("</body>");
                                    if (noBody.length == 2) {
                                        const styleCSS = ""; //"<style>.file_wrapper{background-color:#004175;color:white;font:16px 'Montserrat',sans-serif;line-height:1.4em}.file_wrapper ul{list-style:disc !important;margin:0 0 0 1em !important;padding:0 0 0 1em !important}.file_wrapper ul>ul{list-style:circle !important}.file_wrapper ul>ul>li:last-child{padding-bottom:1em !important}.file_wrapper h1,.file_wrapper h2,.file_wrapper h3,.file_wrapper h4,.file_wrapper p{margin:14px 0 !important}.file_wrapper table{border-collapse:collapse;border:1px solid;width:100%}.file_wrapper table td{border:1px solid;color:white;padding:2.25em}</style>";
                                        pages = noBody[0].split('<div class="-break"></div>');
                                        for (let i=0; i<pages.length;i++) {
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
                });
            })
            .catch(error => {
                res.status(400).json({
                    error: "Registration module file identificator not found"
            })
        });
            
    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }

};

const setPillViewed = (req, res) => {

    if (req.token) {

        let body = req.body;

        if (
            body.module_id && 
            body.pill_id
        ) {

            const moduleId = body.module_id;
            const pillId = body.pill_id;

            const pills = getViewedPills(moduleId, 1);
            pills    
                .then(async pills => {

                    let continues = 0;

                    if (pills.length == 0) {
                        // Primera Pill viewed => Mark module like in-progress (pills): 1
                        
                        const registrationModule = await updateRegistrationModuleStatus(moduleId, 1);
                        if (registrationModule) {
                            continues = 1
                        } else {
                            continues = 2
                        }
                    }

                    if (continues < 2) {

                        const registrationModuleFile = await getViewedPill(pillId);
                        if (registrationModuleFile) {

                            if (registrationModuleFile[0].viewed == 0) {

                                const updatedRegistrationModuleFile = await updateRegistrationModuleFileViewed(pillId);
                                if (updatedRegistrationModuleFile) {
                            
                                    res.status(200).json({
                                        status: "ok",
                                        code: 200,
                                        message: continues == 1 ? "Module status updated and Pill marked like viewed" : "Pill marked like viewed",
                                        refresh: 1
                                    })
                                } else {
                                    res.status(400).json({"error":"Error updating viewed pill"});
                                }
                            } else {
                                res.status(200).json({
                                    status: "ok",
                                    code: 200,
                                    message: "No changes done",
                                    refresh: 0
                                })
                            }

                        } else {
                            res.status(400).json({"error":"Viewed status pill not found"});
                        } 

                    } else {
                        res.status(400).json({"error":"Error updating module status"});
                    }
                })
                .catch(error => {
                    res.status(400).json({"error":"Error recovering viewed pills"})
            });

        } else {
            res.status(400).json({"error":"Necessary data is missing"});
        }

    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }
}

async function getRegistrationModuleFile (id) {

    const file = await RegistrationModuleFile.findAll({
        attributes: ['file_id'],
        where: {
            id
        }
    });
    
    return file;

}

async function getFile (id) {
    
    const registration = await File.findAll({
        attributes: ['id','code','title'],
        where: {
            id
        }
    });
    
    return registration;
}

async function getViewedPills (module_id, viewed) {

    const pills = await RegistrationModuleFile.findAll({
        attributes: ['id'],
        where: {
            module_id,
            viewed
        }
    });
    
    return pills;

}

async function getViewedPill (id) {

    const pill = await RegistrationModuleFile.findAll({
        attributes: ['viewed'],
        where: {
            id
        }
    });
    
    return pill;

}

async function updateRegistrationModuleStatus(id, status) {

    const jsonData = {        
        status
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

async function updateRegistrationModuleFileViewed(id) {

    const jsonData = {        
        viewed: 1
    };

    const jsonWhere = {        
        id
    };

    const moduleResponse = await RegistrationModuleFile.update(
        jsonData,
        {
            where: jsonWhere
        }
    );
    return moduleResponse;
                
}

module.exports = { getItem, setPillViewed };