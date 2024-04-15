const router = require("express").Router();
const { importDriverDocument, createBus, importLicenceDocument,getAllBusesDocs, importBusDocument, getBusById, getAllBuses, getDriverDocuments, getBusDocuments, getLicenceDocuments } = require("../controllers/document-controller");
const { productUpload } = require("../helpers/multer/multer");

router.post('/driver/upload/:id',productUpload.single('images'), importDriverDocument);

router.get('/driver/docs/:id', getDriverDocuments)

router.get('/bus/docs/:id', getBusDocuments)

router.get('/licence/docs', getLicenceDocuments)

router.post('/bus/upload/:id',productUpload.single('images'), importBusDocument);

router.post('/licence/upload',productUpload.single('images'), importLicenceDocument);

router.post('/bus/create', createBus)

router.get('/bus', getAllBuses)

router.get('/bus/alldocs', getAllBusesDocs)

router.get('/bus/:id', getBusById)

module.exports = router;