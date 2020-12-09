var MessageSchema = require('../../schemas/message_schema.js');
var UserSchema = require('../../schemas/user_schema.js');
var multer = require('multer');

const Storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, './uploads/dms');
    },
    filename(req, file, callback) {
        callback(null, `${file.originalname}`);
    },
});
	
var upload = multer({
	storage: Storage,
	// limits: { fileSize: 10000000 }
}).array('files[]', 10);


// module.exports.getAllDms = async function (req, res) {
// 	try {
// 		MessageSchema.find( {} , function (err, doc) {
// 			if (err) {
// 				console.log(err);
// 				res.status(201).json({success: false, message: err});
// 			}else{
// 				res.status(201).json({success: true, dms: doc});
// 			}
// 		});
// 	} catch (error) {
// 		console.error("getAllDms");
// 		console.log(error);
// 		res.status(401).json({success: false, error: error});
// 	}
// }

// module.exports.getDmsByUserId = async function (req, res) {
// 	try{
// 		var user = await UserSchema.findOne({"uuid": req.body.uuid});
// 		if(!user) {
// 			res.status(201).json({success: false, message: "User does not exist"});;
// 			return;
// 		}
// 		var dms = await MessageSchema.find({$or: [{"from":req.body.uuid}, {"to":req.body.uuid}]});
// 		res.status(201).json({success: true, dms: dms});
// 	} catch (error) {
// 		console.error("getDmsByUserId");
// 		console.log(error);
// 		res.status(401).json({success: false, error: error});
// 	}
// }

// module.exports.getDmsByUserContact = async function (req, res) {
// 	try{
// 		var user = await UserSchema.findOne({"uuid": req.body.uuid});
// 		if(!user) {
// 			res.status(201).json({success: false, message: "User does not exist"});;
// 			return;
// 		}
// 		var contactUser = await UserSchema.findOne({"uuid": req.body.contact});
// 		if(!contactUser) {
// 			res.status(201).json({success: false, message: "Contact User does not exist"});;
// 			return;
// 		}
// 		var dms = await MessageSchema.find({$or: [{"from":req.body.uuid, "to": req.body.contact}, {"from":req.body.contact,"to":req.body.uuid}]});
// 		res.status(201).json({success: true, dms: dms});
// 	} catch (error) {
// 		console.error("getDmsByUserId");
// 		console.log(error);
// 		res.status(401).json({success: false, error: error});
// 	}
// }

module.exports.getDmsList = async function (req, res) {
	try{
		var user = await UserSchema.findOne({"uuid": req.body.uuid});
		if(!user) {
			res.status(201).json({success: false, message: "User does not exist"});;
			return;
		}
		var Dms = await MessageSchema.find({$or: [{"from":req.body.uuid}, {"to":req.body.uuid}]});
		var allDms = Dms.filter(val => (val.deleted == null || val.deleted != true));
		var contactList = [];
		var contactFlag = {};
		for(var i=allDms.length - 1; i >= 0 ; i--) {
			var dm = allDms[i];
			var contactName = dm.from == req.body.uuid ? dm.to : dm.from;
			var contact = await UserSchema.findOne({"uuid": contactName});
			if(contact && !contactFlag[contactName]) {
				contactList.push({photo: contact.photo, name: contact.name, uuid: contact.uuid, message: dm.memo, date: dm.updated_at});
				contactFlag[contactName] = true;
			}
		}
		console.log(contactList)

		res.status(201).json({success: true, contact_list: contactList});
	} catch (error) {
		console.error("getDmsList");
		console.log(error);
		res.status(401).json({success: false, error: error});
	}
}

module.exports.getConvo = async function (req, res) {
	try {
		var contactUser = await UserSchema.findOne({"uuid": req.body.contactuuid});
		if(!contactUser) {
			res.status(201).json({success: false, message: "User does not exist"});
			return;
		}
		var convo = await MessageSchema.find({$or: [{"from": req.body.uuid, "to": req.body.contactuuid}, 
													{"from": req.body.contactuuid, "to": req.body.uuid}]});
		console.log("convo", convo);
		res.status(201).json({success: true, convo: convo});
	} catch(error) {
		console.error("getConvo");
		console.log(error);
		res.status(401).json({success: false, error: error});
	}
}

module.exports.sendDm = async function (req, res) {
	upload(req, res,async function (err) {
		if (err) {
		  if (err.code === 'LIMIT_FILE_SIZE') {
			console.log("The file size is too big! Max. 10MB");
			res.json({ success: false, message: 'The file size is too big! Max. 10MB' });
		  } else {
			console.log(err);
			res.json({success: false, message: 'The upload of the file could not be completed.'});
		  }
	  } else {
			try {
				let user = await UserSchema.findOne({"uuid": req.body.from});
				if(!user) {
					res.status(201).json({success: false, message: "From User does not exist"});;
					return;
				}
				user = null;
				user = await UserSchema.findOne({"uuid": req.body.to});
				if(!user) {
					res.status(201).json({success: false, message: "To User does not exist"});;
					return;
				}
				let attachImages = [];
				// req.files.forEach(eachFile => {
				// 	attachImages.push("dms/" + eachFile.filename);
				// });
				var msgInfo = {
					from: req.body.from,
					to: req.body.to,
					memo: req.body.memo,
					attachImages: attachImages
				}
				console.log(attachImages);
				var msg = await MessageSchema.create(msgInfo);
				return res.status(200).json({
					success: true,
					msg: msg
				})
			} catch(error) {
				console.log(error);
				res.status(401).json({success: false, error: error});
			}
		}
	})	
}
