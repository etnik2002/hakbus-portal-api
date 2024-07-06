const router = require("express").Router();
const { refund } = require("../controllers/bank-controller");


router.post('/refund', refund);

module.exports = router;