const BusDocument = require("../models/BusDocument");
const Bus = require("../models/Bus");
const LicenceDocument = require("../models/LicenceDocument");
const DriverDocument = require("../models/DriverDocument");
const cloudinary = require('cloudinary').v2;
const moment = require("moment");
const Driver = require("../models/Driver");

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});


module.exports = {

    importDriverDocument: async (req,res) => {
        try {
            const validUntilDate = new Date(req.body.validUntil);
            const expiresAtDate = new Date(validUntilDate);
            console.log({validUntilDate, expiresAtDate})
            expiresAtDate.setDate(validUntilDate.getDate() - (parseInt(req.body.expiresAt) * 7));

            const images = req.files || req.file;
            const newDoc = new DriverDocument({
                images: images,
                validUntil: req.body.validUntil,
                expiresAt: expiresAtDate,
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
            const result = await cloudinary.uploader.upload(req.file?.path)
            const docs = await BusDocument.find({ bus: req.params.id });
            return res.status(200).json(docs)
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)  
        }
    },

    importLicenceDocument: async (req,res) => {
        try {
            const validUntilDate = new Date(req.body.validUntil);
            const expiresAtDate = new Date(validUntilDate);
            console.log({validUntilDate, expiresAtDate})
            expiresAtDate.setDate(validUntilDate.getDate() - (parseInt(req.body.expiresAt) * 7));
            const images = req.files;
            const newDoc = new LicenceDocument({
                images: images,
                validUntil: req.body.validUntil,
                expiresAt: expiresAtDate,
                type: req.body.tyoe
                
            })
            
            await newDoc.save();
            return res.status(200).json("New licence doc saved");
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)
        }
    },

    getAllBusesDocs: async (req,res) => {
        try {
            const all = await BusDocument.find({}).populate("bus");
            return res.status(200).json(all)
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    getAllDriverDocs: async (req,res) => {
        try {
            const all = await DriverDocument.find({}).populate("driver");
            return res.status(200).json(all)
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    importBusDocument: async (req, res) => {
        try {
            const images = req.files || req.file;
            const body = req.body;
    
            const validUntilDate = new Date(req.body.validUntil);
            const expiresAtDate = new Date(validUntilDate);
            console.log({validUntilDate, expiresAtDate})
            expiresAtDate.setDate(validUntilDate.getDate() - (parseInt(req.body.expiresAt) * 7));
            
            const newDoc = new BusDocument({
                images: images,
                validUntil: req.body.validUntil,
                expiresAt: expiresAtDate, 
                type: req.body.type,
                bus: req.params.id,
            });
    
            await newDoc.save();
            return res.status(200).json("New bus doc saved");
        } catch (error) {
            console.log(JSON.stringify(error.response));
            return res.status(500).json(error);
        }
    },
    
    searchBusDocument: async (req, res) => {
        try {
            const searchTerm = req.query.search;
            if (!searchTerm || typeof searchTerm !== 'string') {
                return res.status(400).json("Invalid search query");
            }
            const bus = await Bus.findOne({plates: searchTerm})
            const docs = await BusDocument.find({ 'bus': bus._id }).populate('bus');
            console.log(searchTerm, req.query);
            
            if (docs.length === 0) {
                return res.status(404).json("No documents found");
            }
    
            return res.status(200).json(docs);
        } catch (error) {
            console.error(error.message);
            return res.status(500).json(error);
        }
    },
    
    searchDriverDocument: async (req, res) => {
        try {
            const searchTerm = req.query.search;
            if (!searchTerm || typeof searchTerm !== 'string') {
                return res.status(400).json("Invalid search query");
            }
            const driver = await Driver.findOne({name: searchTerm})
            const docs = await Driver.find({ 'driver': driver._id }).populate('driver');
            console.log(searchTerm, req.query);
            
            if (docs.length === 0) {
                return res.status(404).json("No documents found");
            }
    
            return res.status(200).json(docs);
        } catch (error) {
            console.error(error.message);
            return res.status(500).json(error);
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