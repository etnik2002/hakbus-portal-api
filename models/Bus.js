const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const busSchema = mongoose.Schema({
    plates: {
        type: String,
    },
    series: {
        type: String,
    },
})


module.exports = mongoose.model("Bus", busSchema);