const router = require("express").Router();
const { verifyActiveAgent, verifyDeletionPin, ceoAccessToken, verifyAgentAccessToken, verifyCeoOrObsToken, getCeoAndAgency } = require("../auth/auth");
const { createAgency, loginAsAgency, getAll,payDebt, getSearchedTickets, deleteAgency, editAgency, getAgenciesInDebt, confirmBookingPayment, getSingleAgency, getAgencyTickets, soldTickets, scanBooking, createScanningToken, getToken, deleteToken, sendBookingAttachment, getAgencySales, makeBookingForCustomers, applyForCollaboration, getAgenciesInTotalDebt, getDebtFromDateToDate, 
 } = require("../controllers/agency-controller");
const { attachmentUpload, agentUpload } = require('../helpers/multer/multer');
const { requestLimiter } = require("../auth/limiter");
const apicache = require("apicache");
const cache = apicache.middleware;
router.use(requestLimiter);

router.get('/sales/:id',cache('1 minutes'), getAgencySales)

router.get('/debt',cache('1 minutes'), getAgenciesInDebt);

router.get('/totaldebt',cache('1 minutes'), getAgenciesInTotalDebt);

router.post('/create',verifyCeoOrObsToken, createAgency);

router.post('/sales/register',agentUpload.single("document"), applyForCollaboration)

router.post('/scan/:bookingID/:agencyID', scanBooking)

router.post('/booking/create/:sellerID/:ticketID',verifyActiveAgent, makeBookingForCustomers);

router.post('/payment/confirm/:id/:agency_id', confirmBookingPayment);

router.post('/attachment/send', attachmentUpload.array('attachments'), sendBookingAttachment)

router.get('/ticket',cache('10 minutes'), getSearchedTickets)

router.post('/create/token/:bookingID/:ticketID', createScanningToken);

router.get('/get-token', getToken);

router.post('/delete-token/:token', deleteToken);

router.get('/getdebt/:id', getDebtFromDateToDate);

router.post('/login', loginAsAgency);

router.get('/',verifyCeoOrObsToken, getAll);

router.get('/:id',cache('1 minutes'), getSingleAgency)

router.post('/delete/:id',verifyDeletionPin, deleteAgency)

router.post('/edit/:id', editAgency)

router.post('/paydebt',getCeoAndAgency, payDebt)

router.get('/tickets/:id', getAgencyTickets)

router.get('/sold/:id', soldTickets)

module.exports = router;