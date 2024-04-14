const router = require("express").Router();
const { importDriverDocument, createBus, importLicenceDocument, importBusDocument, getBusById, getAllBuses, getDriverDocuments, getBusDocuments, getLicenceDocuments } = require("../controllers/document-controller");
const { docUpload } = require("../helpers/multer/multer");

router.post('/driver/upload/:id',docUpload.array('images'), importDriverDocument);

router.get('/driver/docs/:id', getDriverDocuments)

router.get('/bus/docs/:id', getBusDocuments)

router.get('/licence/docs', getLicenceDocuments)

router.post('/bus/upload/:id',docUpload.array('images'), importBusDocument);

router.post('/licence/upload',docUpload.array('images'), importLicenceDocument);

router.post('/bus/create', createBus)

router.get('/bus', getAllBuses)

router.get('/bus/:id', getBusById)

module.exports = router;