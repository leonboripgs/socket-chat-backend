const fs = require('fs')
const crypto = require('crypto')
var UserSchema = require('../../schemas/user_schema.js');

module.exports.getAllUserData = async function (req, res) {
  try {
    UserSchema.find( {} , function (err, doc) {
      if (err) {
        console.log(err);
        res.status(201).json({success: false, message: err});
      } else {
        res.status(201).json({success: true, doc: doc});
      }
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({success: false, error: error});
  }
}

function toHexString(byteArray) {
	return Array.from(byteArray, function(byte) {
	  return ('0' + (byte & 0xFF).toString(16)).slice(-2);
	}).join('')
  }
module.exports.checkIfPhoneAllowed = async function (req, res) {
  try {
    console.log(req.body);
    console.log(req.body.pbkey);
    user = await UserSchema.findOne({uuid: req.body.uuid});
    if (!user) {
      var user = UserSchema.create({
        name: req.body.name,
        uuid: req.body.uuid,
        fcm_token: req.body.fcm_token
      });
      res.status(201).json({success: false, user: user});
      return;
    } else {
      user.fcm_token = req.body.fcm_token
      user = await user.save();
    }

    let resultDoc = {
      name: user.name,
      uuid: user.uuid,
      photo: user.photo,
      permission: user.permission,
      fcm_token: user.fcm_token
    };

    res.status(201).json({success: true, user: resultDoc});
    return;
  } catch (error) {
    console.log(error);
    res.status(401).json({success: false, error: error});
  }
}

module.exports.getPbKey = async function (req, res) {
  try {
    var pbkey = await fs.readFile('../../pbKey', 'utf8');
    if (pbKey != "")
      res.status(201).json({success: true, user: pbkey});
    else 
      res.status(201).json({success: false});
    console.log(pbKey);
  } catch (error) {
    console.log(error);
    res.status(401).json({success: false, error: error})
  }
}

module.exports.setSymmetricKey = async function (req, res) {
  try {
    console.log(req.body)
    if (req.body.symmetric != "") {
      fs.readFile('./pvKey', 'utf8', async function (err, key) {
        if (err) {
          console.error("can not get private key of server")
          res.status(201).json({success: false, user: null});
          return;
        }
        var symmetricKey = crypto.privateDecrypt({
            key: key,
            passphrase: '',
            padding: crypto.constants.RSA_PKCS1_PADDING
          },
          Buffer.from(req.body.symmetric, "base64")
        )
        console.log(symmetricKey.toString('utf8'))
        var symmetricUtf = Buffer.from(symmetricKey, 'utf8')
        const dechiper = crypto.createCipheriv('aes-128-gcm', symmetricUtf, symmetricUtf)
        var decrypted = Buffer.concat([dechiper.update(Buffer.from(req.body.cipher, 'ascii')), dechiper.final()]);
        console.log("=====================");
        console.log(decrypted.toString());
        var user = await UserSchema.findOneAndUpdate({"uuid": req.body.uuid}, {"symmetric": symmetricKey.toString('utf8')});
        console.log(user)
        res.status(201).json({success: true, res: decrypted});
        return;
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({success: false, error: error})
  }
}