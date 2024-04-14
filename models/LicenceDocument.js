const mongoose = require("mongoose");

const licenceDocumentSchema = mongoose.Schema({
    images: [],
    validUntil: { type: String },
    expiresAt: { type: String },

})


module.exports = mongoose.model("LicenceDocument", licenceDocumentSchema);