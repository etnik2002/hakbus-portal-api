const router = require("express").Router();
const { verifyDeletionPin } = require("../auth/auth");
const { createLine, getLineBookings, getSingleLineBookings,getAllLinesNoCache, getAllLines,getLineTickets, deleteLine,getLineById, findTodaysLineTickets, editLine, modifyLineTickets, activateLineTickets, deactivateLineTickets } = require("../controllers/line-controller");
const { requestLimiter } = require("../auth/limiter");
const apicache = require("apicache");
const cache = apicache.middleware;
router.use(requestLimiter);

router.post('/create', createLine);

router.get('/',cache('1 minute'), getAllLines);

router.get('/nocache', getAllLinesNoCache);

router.get('/today', findTodaysLineTickets)

router.get('/tickets/:id', getLineTickets)

router.post('/modify/tickets', modifyLineTickets)

router.get('/:id',cache('1 minute'), getLineById)

router.get('/line-bookings', getLineBookings);

router.get('/line-bookings/:id/:from/:to', getSingleLineBookings)

router.post('/delete/:id',verifyDeletionPin, deleteLine)

router.post('/deactivate/:id', deactivateLineTickets)

router.post('/activate/:id',activateLineTickets)

router.post('/edit/:id', editLine)

module.exports = router;