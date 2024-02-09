const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const ceoSchema = mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: Number
    },
    totalProfit: {
        type: Number,
    },
    notifications: [
        {
            message: {
                type: String,
            },
            title: {
                type: String,
            },
            link: {
                type: String,
            },
            agency_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Agency',
            },
            ticket: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Ticket',
            },
            value: {    
                type: Number,
            },
            confirmed: {
                type: Boolean,
                default: false,
            },
            seen: {
                type: Boolean,
            }
        },
    ],
    role: {
        type: String,
        enum : ['admin','superAdmin', 'observer', 'ceo'],
        default: 'admin',
    },
    access: [String],
    lines: [],
    nrOfSeatsNotification: {
        type: Number,
    },
    deletionPin: {
        type: String
    }

}, { timestamps: true })

ceoSchema.methods.generateAuthToken = function (data) {
    data.password = undefined;
    const token = jwt.sign({ data }, process.env.OUR_SECRET, {
        expiresIn: '1d',
    });

    return token;
};


module.exports = mongoose.model("Ceo", ceoSchema);
