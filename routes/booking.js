const { placeBooking, getSingleBooking, getWeeklyBookings,getSearchedBooking, getAllBookings, getMonthlyBookings, getFilteredBookings, getBookingsFromDateRange, payBooking, cancelNotPaidImmediatelyBooking, deleteBooking, getOnlineBookings } = require("../controllers/booking-controller");
const router = require("express").Router()
const { requestLimiter } = require("../auth/limiter");
const apicache = require("apicache");
const cache = apicache.middleware;
router.use(requestLimiter);


router.post('/create/:buyerID/:ticketID', placeBooking);

router.post('/pay/:id/:tid', payBooking)

router.post('/cancel-immediately/:id', cancelNotPaidImmediatelyBooking)

router.get('/monthly', getMonthlyBookings);

router.get('/online', getOnlineBookings);

router.post("/delete/:id", deleteBooking);

router.get('/filtered', getFilteredBookings);

router.post('/search', getSearchedBooking)

router.get('/date-range', getBookingsFromDateRange)

router.post('/create/:buyerID/:sellerID/:ticketID', placeBooking);

router.get('/:id',cache('10 minutes'), getSingleBooking);

module.exports = router;