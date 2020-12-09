var express = require('express');
var router = express.Router();
var _onboarding = require('./ctl_onboarding.js');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Onboarding Time: ', Date.now());
  next();
});

// Onboarding
router.post('/calc-carbon-emission', _onboarding.calcCarbonEmission);
router.post('/get-zipcode-data', _onboarding.getZipCodeData);

module.exports = router;