const mongoose = require("mongoose");

const driverDocumentSchema = mongoose.Schema({
    images: [],
    validUntil: { type: String },
    expiresAt: { type: Date },
    type: {
        type: String,
        enum: ['leja', 'leternjoftim', 'kartelatahografis', 'licenca', 'lekarsko', "pasaporta"]
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver"
    },
    isAlerted: { type: Boolean, default: false }

})


module.exports = mongoose.model("DriverDocument", driverDocumentSchema);