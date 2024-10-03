require ('dotenv').config()
const public = require("./routes/public");
const userProfile = require("./routes/user_profiles");
const registration = require("./routes/registrations");
const pill = require("./routes/pills");
const moduleRegistration = require("./routes/modules");
const examRegistration = require('./routes/exam');
const auth = require("./routes/auth");
const express = require("express");
const { dbConnectMySql } = require("./config/mysql")
const cors = require('cors')
const app = express();

app.use(cors()); 

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/user_profiles', userProfile);
app.use('/api/registrations', registration);
app.use('/api/pills',pill);
app.use('/api/modules',moduleRegistration);
app.use('/api/exam',examRegistration);
app.use('/api/auth',auth);
app.use('/api',public);
app.use("/health",(req,res)=>{
    res.json({status: "UP"})
});

app.use("/text",(req,res)=>{
    fetch("https://staging-ariadne-back-storage.infrastructure.clasingelts.com/public/activities/texts/TSC_A1_20_3.html")
    .then(response => response.text())
    .then(text => res.json(text))
});


const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log (`API Clasing Fundae works correctly in port ${port}`)
})

dbConnectMySql();