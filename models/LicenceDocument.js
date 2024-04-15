const mongoose = require("mongoose");

const licenceDocumentSchema = mongoose.Schema({
    images: [],
    validUntil: { type: String },
    expiresAt: { type: Date },

})


module.exports = mongoose.model("LicenceDocument", licenceDocumentSchema);