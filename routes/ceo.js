const router = require("express").Router();
const { ceoAccessToken, verifyCeoOrObsToken } = require("../auth/auth");
const { createCeo, login, getStats, deactivateAgency, getCeoNotifications ,activateAgency,editObserver,getObserverById, addCity, getAllCities, deleteCity, getCeoById, confirmDebtPayment, getAllObservers, deleteObs, setNrOfSeatsNotification, sendBookingToEmail, getAllCitiesPagination, changePassword, changeEmail, changePin, importCitiesFromExcel, editCity} = require("../controllers/ceo-controller");
const { attachmentUpload, excelUpload } = require('../helpers/multer/multer');
const { requestLimiter } = require("../auth/limiter");
const apicache = require("apicache");
const cache = apicache.middleware;
router.use(requestLimiter);


// router.post('/attachment/send', attachmentUpload.array('attachments'), sendBookingToEmail)

router.post('/create', createCeo);

router.post('/login', login);

router.get('/observer', getAllObservers);

router.get('/observer/:id', getObserverById);

router.post('/observer/edit/:id', editObserver);

router.post('/observer/delete/:id', deleteObs);

router.get('/all-cities',cache('1 minutes'), getAllCities);

router.post('/city/edit/:id', editCity)

router.get('/all-cities-pagination', getAllCitiesPagination);

router.get('/stats', getStats);

router.get('/:id',cache('5 minutes'), getCeoById);

router.get('/notifications/:id', getCeoNotifications);

router.post('/deactivate/:id',deactivateAgency);

router.post('/activate/:id',activateAgency);

router.post ('/add-city',verifyCeoOrObsToken, addCity);

// router.post ('/add-city-excel', excelUpload.single("file"), importCitiesFromExcel);

router.post('/confirm-debt/:id/:notificationId', confirmDebtPayment);

router.post('/seat-notificaiton', setNrOfSeatsNotification)

router.post('/change-password/:id', changePassword)

router.post('/change-email/:id', changeEmail)

router.post('/change-pin/:id', changePin)

router.post('/city/delete/:id', deleteCity);


module.exports = router;