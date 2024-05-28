const router = require("express").Router();
const { importDriverDocument, createBus,getAllDriverDocs, importLicenceDocument,getAllBusesDocs,searchDriverDocument, importBusDocument, getBusById, getAllBuses, getDriverDocuments, getBusDocuments, getLicenceDocuments, searchBusDocument, deleteDriverDoc, deleteBusDoc, deleteLicenceDoc } = require("../controllers/document-controller");
const { productUpload } = require("../helpers/multer/multer");

router.post('/driver/upload/:id',productUpload.array('images'), importDriverDocument);

router.post('/bus/upload/:id',productUpload.array('images'), importBusDocument);

router.post('/licence/upload',productUpload.array('images'), importLicenceDocument);

router.get('/driver/docs/:id', getDriverDocuments)

router.get('/bus/docs/:id', getBusDocuments)

router.get('/bus/search', searchBusDocument)

router.get('/driver/search', searchDriverDocument)

router.get('/licence/docs', getLicenceDocuments)

router.post('/bus/create', createBus)

router.post('/driver/delete', deleteDriverDoc)

router.post('/licence/delete', deleteLicenceDoc)

router.post('/bus/delete', deleteBusDoc)

router.get('/bus', getAllBuses)

router.get('/driver/alldocs', getAllDriverDocs)

router.get('/bus/alldocs', getAllBusesDocs)


router.get('/bus/:id', getBusById)

module.exports = router;