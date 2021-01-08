var MessageSchema = require("../../schemas/message_schema.js");
var UserSchema = require("../../schemas/user_schema.js");
var RoomSchema = require("../../schemas/room_schema");
const crypto = require("crypto");
var multer = require("multer");

const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "./uploads/");
  },
  filename(req, file, callback) {
    callback(null, Date.now() + `${file.originalname}`);
  },
});

var upload = multer({
  storage: Storage,
  // limits: { fileSize: 10000000 }
}).single("attachment");

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
  try {
    var user = await UserSchema.findOne({ uuid: req.body.uuid });
    if (!user) {
      res.status(201).json({ success: false, message: "User does not exist" });
      return;
    }
    var Dms = await MessageSchema.find({
      $or: [{ from: req.body.uuid }, { to: req.body.uuid }],
    });
    var allDms = Dms.filter(
      (val) => val.deleted == null || val.deleted != true
    );
    var contactList = [];
    var contactFlag = {};
    for (var i = allDms.length - 1; i >= 0; i--) {
      var dm = allDms[i];
      var contactName = dm.from == req.body.uuid ? dm.to : dm.from;
      var contact = await UserSchema.findOne({ uuid: contactName });
      if (contact && !contactFlag[contactName]) {
        contactList.push({
          photo: contact.photo,
          name: contact.name,
          uuid: contact.uuid,
          message: dm.memo,
          date: dm.updated_at,
        });
        contactFlag[contactName] = true;
      }
    }
    console.log(contactList);

    res.status(201).json({ success: true, contact_list: contactList });
  } catch (error) {
    console.error("getDmsList");
    console.log(error);
    res.status(401).json({ success: false, error: error });
  }
};

module.exports.getConvo = async function (req, res) {
  try {
    var room = await RoomSchema.findOne({
      $or: [
        { user: req.body.user, other_user: req.body.other_user },
        { user: req.body.other_user, other_user: req.body.user },
      ],
    });
    console.log(room);
    if (!room) {
      var symmetric = "";
      var characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789S";
      for (let i = 0; i < 16; i++) {
        symmetric += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      let roomInfo = {
        user: req.body.user,
        other_user: req.body.other_user,
        symmetric: symmetric,
      };
      var room = await RoomSchema.create(roomInfo);
      res.status(201).json({ success: true, room, convo: [] });
    } else {
      var messages = await MessageSchema.find({ roomId: room._id });
      res.status(201).json({ success: true, room, convo: messages });
    }
  } catch (error) {
    console.error("get rooms");
    console.log(error);
    res.status(401).json({ success: false, error: error });
  }
};

module.exports.getRooms = async function (req, res) {
  try {
    var rooms = await RoomSchema.find({
      $or: [{ user: req.body.user }, { other_user: req.body.user }],
    });
    var roomsInfo = [];
    for (let i = 0; i < rooms.length; i++) {
      var otherUser =
        rooms[i].user == req.body.user ? rooms[i].other_user : rooms[i].user;
      var lastMsg = await MessageSchema.findOne(
        { roomId: rooms[i]._id },
        {},
        { sort: { created_at: -1 } }
      );
      if (lastMsg) {
        var otherUserInfo = await UserSchema.findOne({ uuid: otherUser });
        console.log(otherUserInfo);
        roomsInfo.push({
          photo: otherUserInfo.photo,
          name: otherUserInfo.name,
          uuid: otherUserInfo.uuid,
          message: lastMsg.memo ? lastMsg.memo : "",
          messageType: lastMsg.type,
          date: lastMsg.updated_at,
          roomId: rooms[i]._id,
          enc: rooms[i].symmetric,
        });
      }
    }
    console.log(roomsInfo);
    res.status(201).json({ success: true, contact_list: roomsInfo });
  } catch (error) {
    console.error("getConvo");
    console.log(error);
    res.status(401).json({ success: false, error: error });
  }
};

module.exports.sendDm = async function (req, res) {
  upload(req, res, async function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        console.log("The file size is too big! Max. 10MB");
        res.json({
          success: false,
          message: "The file size is too big! Max. 10MB",
        });
      } else {
        console.log(err);
        res.json({
          success: false,
          message: "The upload of the file could not be completed.",
        });
      }
    } else {
      //   console.log(req.file)
      try {
        let room = await RoomSchema.findOne({ _id: req.body.roomId });
        if (!room) {
          res.status(201).json({ success: false, message: "Invalid room" });
          return;
        }
        let user = await UserSchema.findOne({ uuid: req.body.from });
        if (!user) {
          res
            .status(201)
            .json({ success: false, message: "From User does not exist" });
          return;
        }
        console.log("--- send message to room ---");
        console.log(room);
        let otherUserUUID =
          room.user == req.body.from ? room.other_user : room.user;
        let otherUser = await UserSchema.findOne({ uuid: otherUserUUID });
        console.log(otherUser);
        var encryptedFileName = "";
        if (req.file) {
          const cipher = crypto.createCipheriv(
            "aes-128-gcm",
            room.symmetric,
            room.symmetric
          );
          encryptedFileName = Buffer.concat([
            cipher.update(Buffer.from(req.file.filename)),
            cipher.final(),
          ]).toString("hex");
          console.log(encryptedFileName.toString());
        }

        var msgInfo = {
          roomId: req.body.roomId,
          from: req.body.from,
          memo: req.body.memo ? req.body.memo : "",
          type: req.body.type ? req.body.type : "0",
          fileContent: req.body.fileContent ? req.body.fileContent : "",
          attachment: encryptedFileName,
        };
        var msg = await MessageSchema.create(msgInfo);
        console.log(msg);
        return res.status(200).json({
          success: true,
          msg: msg,
          fcm_token: otherUser.fcm_token,
        });
      } catch (error) {
        console.log(error);
        res.status(401).json({ success: false, error: error });
      }
    }
  });
};
