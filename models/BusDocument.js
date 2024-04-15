const mongoose = require("mongoose");

const busDocumentSchema = mongoose.Schema({
    images: [],
    validUntil: { type: String },
    expiresAt: { type: Date },
    type: {
        type: String,
        enum: ['libreza', 'licenca', 'eurostandard', 'tepi', 'bazhdiranjetaho', '6mujorshja', '6mujorshjadekra']
    },
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus"
    }
})


module.exports = mongoose.model("BusDocument", busDocumentSchema);