var express = require('express');
var router = express.Router();
var _account = require('./ctl_account.js');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Account Time: ', Date.now());
  next();
});

// Account
router.get('/get-all', _account.getAllUserData);
router.post('/check-uuid', _account.checkIfPhoneAllowed);
router.get('/enc-pub', _account.getPbKey);
router.post('/set-symmetric-key', _account.setSymmetricKey);

module.exports = router;