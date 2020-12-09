var express = require('express');
var router = express.Router();
var _dms = require('./ctl_dms.js');
// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('DMs Time: ', Date.now());
  next();
});

// Register
// router.post('/get-all', _dms.getAllDms);
// router.post('/get-by-user', _dms.getDmsByUserId);
// router.post('/get-by-contact', _dms.getDmsByUserContact);
router.post('/get-contact-list', _dms.getDmsList);
router.post('/get-convo', _dms.getConvo);
router.post('/send-message', _dms.sendDm);
// router.post('/delete-convo', _dms.deleteConvo);

// router.post('/send-dm', _dms.sendDm);
// router.post('/accept-dm', _dms.acceptDm);
// router.post('/cancel-dm', _dms.cancelDm);

module.exports = router;