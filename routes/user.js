const router = require("express").Router();
const { registerUser, login, getUserProfile, getSingleUser,getUserBookings, deleteUser, getAllUsers } = require("../controllers/user-controller");
const { requestLimiter } = require("../auth/limiter");
const apicache = require("apicache");
const cache = apicache.middleware;
router.use(requestLimiter);

router.post('/register', registerUser);

router.get('/all',cache('1 minutes'), getAllUsers);

router.post('/login', login);

router.get('/:id',cache('1 minutes'), getUserProfile);

router.post('/delete/:id', deleteUser);

router.get('/unique/:id',cache('1 minutes'), getSingleUser);

router.get('/bookings/:id',cache('1 minutes'), getUserBookings);


module.exports = router;