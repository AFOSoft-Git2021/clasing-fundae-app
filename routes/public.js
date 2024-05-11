const express = require("express");
const route = express.Router();

route.get ('/', (req, res) => {
    
    res.send("Bienvenido a la API privada de Clasing Fundae.");
});

module.exports = route;