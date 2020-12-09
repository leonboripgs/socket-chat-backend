var MetaUserSchema = require('../../schemas/metauser_schema.js');
var passport = require('passport');
var jwtDecode = require('jwt-decode');
var _tokenCheck = require('../../config/auth_token.js');
var jwt = require('jsonwebtoken');


//-------------------------------------
//: Module for log in with User data  :
//-------------------------------------
module.exports.signin = async function (req, res) {
  try{
    console.log("[auth]->[signin]");
    passport.authenticate('local', function(err, user, info){
    var token;

    if (err) {
      console.log("passport error exception");
      res.status(401).json(err);
      return;
    }

    if(user){
      token = user.generateJwt();
      var decodedToken = jwtDecode(token);
      res.status(201).json({
        'success': true,
        'access_token' : token,
        'decodedToken' : decodedToken, 
        'avatar' : user.avatar
      });

    } else {
      // If user is not found
      res.status(401).json(info);
    }
    })(req, res);
  } catch(error) {
    console.log(err);
    res.status(403).json({"message": "Signin failed"});
  }

}

//-------------------------------------
//: Module for log in with Auth-token :
//-------------------------------------
module.exports.access_token = function (req, res) {
console.log("[auth]->[access_token]");
  try {
    var token = req.params.access_token;
    if(token){
        jwt.verify(token, 'bAKVdqczerYAYKdMxsaBzbFUJU6ZvL2LwZuxhtpS', function(err, decoded) {
          // console.log(decoded);
          if(err){
            if (err.name === "TokenExpiredError") {
                console.log("Verifying auth token => Token Expired");
                res.status(201).json({"success": false, "message": "Verifying token : Expired"});
            } else {
                console.log("Verifying auth token => Faild");
                res.status(201).json({"success": false, "message": "Verifying token : Wrong Token"});
            }
          }else{
            var decodedToken = jwtDecode(token);
            MetaUserSchema.findOne({'username': decodedToken.userName}, (err, doc) => {

              if(!err) {
                decodedToken.balance = doc.balance;
                decodedToken.carbonOffset = doc.carbonOffset;
                console.log("Verifying auth token => Success", doc.username);
                res.status(201).json({
                  'success' : true,
                  'access_token' : token,
                  'decodedToken' : decodedToken,
                  'avatar': doc.avatar,
                });
              } else {
                console.log(err);
                console.log("Verifying auth token => False User not found");
                res.status(201).json({
                  'success' : false,
                  'message' : "User not found"
                });
              }
            });
          }
        });
    }else{
      console.log("Request hasn't got Auth token");
      res.status(401).json({"message": "failed"});
    }
  } catch(err) {
    console.log(err);
    res.status(401).json({"message": "failed"});
	}
}