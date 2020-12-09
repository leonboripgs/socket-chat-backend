var express = require('express');
var router = express.Router();
var _auth = require('./ctl_login.js');
var _register = require('./ctl_register.js');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Auth Time: ', Date.now());
  next();
});

// Register
router.post('/register', _register.register);
router.post('/signin', _auth.signin);
router.get('/access-token/:access_token', _auth.access_token);

module.exports = router;