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

module.exports.checkIfPhoneAllowed = async function (req, res) {
  try {
    console.log(req.body.uuid)
    UserSchema.findOne( {uuid: req.body.uuid}, function (err, doc) {
      if (err) {
        console.log(err);
        res.status(201).json({success: false, message: err});
      } else {
        if (!doc) {
          res.status(201).json({success: false, user: null})
          return;
        }
        let resultDoc = {
          name: doc.name,
          uuid: doc.uuid,
          photo: doc.photo
        }
        console.log(resultDoc)
        res.status(201).json({success: true, user: resultDoc})
      }
    })
  } catch (error) {
    console.log(error);
    res.status(401).json({success: false, error: error});
  }
}
