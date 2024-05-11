const { Sequelize } = require('sequelize');

const database = process.env.MYSQL_DATABASE;
const username = process.env.MYSQL_USERNAME;
const password = process.env.MYSQL_PASSWORD;
const host = process.env.HOST;

const sequelize = new Sequelize (
    database,
    username,
    password,
    {
        host,
        dialect: "mysql"
    }
)

const dbConnectMySql = async() => {

    try {
        await sequelize.authenticate();
        console.log("MySQL ok connection");
    } catch (e) {
        console.log("MySQL error connection", e);
    }

};

module.exports.sequelize = sequelize;
module.exports.dbConnectMySql = dbConnectMySql;
