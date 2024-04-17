const mongoose = require("mongoose");

const licenceDocumentSchema = mongoose.Schema({
    images: [],
    validUntil: { type: String },
    expiresAt: { type: Date },
    isAlerted: { type: Boolean, default: false }

})


module.exports = mongoose.model("LicenceDocument", licenceDocumentSchema);