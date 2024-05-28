const Registration = require("../models/Registration");
const File = require("../models/File");
const fs = require("fs");

/*
* @param {*} req  
*/

const getItem = (req, res) => {

    if (req.token) {

        const pillId = req.params.id;
        
        const pills = getFile(pillId);
        pills    
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
        });
            
    } else {
        res.status(400).json({
            error: "JWT must be provided"
        })
    }

};

async function getFile (id) {
    
    const registration = await File.findAll({
        attributes: ['id','code','title'],
        where: {
            id
        }
    });
    
    return registration;
}

module.exports = { getItem };