require ('dotenv').config()
const userProfile = require("./routes/user_profiles");
const registration = require("./routes/registrations");
const auth = require("./routes/auth");
const express = require("express");
const { dbConnectMySql } = require("./config/mysql")
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/user_profiles', userProfile);
app.use('/api/registrations', registration);
app.use('/api/auth',auth);

const port = process.env.PORT;

app.listen(port, () => {
    console.log (`API Clasing Fundae works correctly in port ${port}`)
})

dbConnectMySql();