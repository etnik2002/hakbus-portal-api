const BusDocument = require("../models/BusDocument");
const Bus = require("../models/Bus");
const LicenceDocument = require("../models/LicenceDocument");
const DriverDocument = require("../models/DriverDocument");


module.exports = {

    importDriverDocument: async (req,res) => {
        try {
            const images = req.files;
            const newDoc = new DriverDocument({
                images: images,
                validUntil: req.body.validUntil,
                expiresAt: req.body.expiresAt,
                type: req.body.type,
                driver: req.params.id,

            })
                        
            await newDoc.save();
            return res.status(200).json("New driver doc saved");
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)
        }
    },

    getDriverDocuments: async (req,res) => {
        try {
            const docs = await DriverDocument.find({ driver: req.params.id });
            return res.status(200).json(docs)
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)  
        }
    },

    getLicenceDocuments: async (req,res) => {
        try {
            const docs = await LicenceDocument.find({});
            return res.status(200).json(docs)
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)  
        }
    },

    getBusDocuments: async (req,res) => {
        try {
            const docs = await BusDocument.find({ bus: req.params.id });
            return res.status(200).json(docs)
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)  
        }
    },

    importLicenceDocument: async (req,res) => {
        try {
            const images = req.files;
            const newDoc = new LicenceDocument({
                images: images,
                validUntil: req.body.validUntil,
                expiresAt: req.body.expiresAt,
                
            })
            
            await newDoc.save();
            return res.status(200).json("New licence doc saved");
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)
        }
    },

    importBusDocument: async (req,res) => {
        try {
            const images = req.files;
            const newDoc = new BusDocument({
                images: images,
                validUntil: req.body.validUntil,
                expiresAt: req.body.expiresAt,
                type: req.body.type,
                bus: req.params.id,
            })

            await newDoc.save();
            return res.status(200).json("New bus doc saved");
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)
        }
    },

    createBus: async (req,res) => {
        try {
            const newBus = new Bus({
                plates: req.body.plates,
                series: req.body.series
            })

            await newBus.save();
            return res.status(200).json("New bus saved");
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)
        }
    },

    getAllBuses: async (req,res) => {
        try {
            const buses = await Bus.find({});
            return res.status(200).json(buses)
        } catch (error) {
            console.log(error)
            return res.status(500).json(error)
        }
    },

    getBusById: async (req,res) => {
        try {
            const buses = await Bus.findById(req.params.id);
            return res.status(200).json(buses)
        } catch (error) {
            console.log(error)
            return res.status(500).json(error)
        }
    },

}