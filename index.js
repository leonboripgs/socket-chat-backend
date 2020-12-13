const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const { generateKeyPairSync } = require("crypto") 
const fs = require("fs")

const fetch = require("node-fetch"); // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require("util"); // node only; native TextEncoder/Decoder
// [ MongoDB ] connection
require("./config/db_connection.js");

const AccountRouter = require("./modules/account/router");
const MessageRouter = require("./modules/dms/router");

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
	// The standard secure default length for RSA keys is 2048 bits
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'pkcs1',
    format: 'pem'
  }, 
  privateKeyEncoding: { 
    type: 'pkcs1', 
    format: 'pem', 
    cipher: 'aes-256-cbc', 
    passphrase: ''
  } 
});

fs.writeFile('pbKey', publicKey, 'utf8', function (err) {
  if (err) return console.log("Error saving publicKey", err)
  console.log('Public Key created')
})
fs.writeFile('pvKey', privateKey, 'utf8', function (err) {
  if (err) return console.log("Error saving privateKey", err)
  console.log('Private Key created')
})

let app = express();

// Uploading file module
app.use(express.static("uploads"));
app.use(cors());
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/account', AccountRouter);
app.use('/api/message', MessageRouter);

app.get("/", function (req, res) {
  return res.send("Hello new World");
});

// ---------------------------------------------------------------------------

const port = process.env.PORT || 80;
const server = app.listen(port || 80, () => {
  console.log("========== starting Middleware server ==========");
  console.log("Server listening on port:", port);
});

const io = require("./utils/io");
var onlineUsers = {};

io.connect(server);

io.getSocket().on("connection", function (socket) {
  console.log("socket client connected: id=>" + socket.id);

  socket.on("connect-user", function (data) {
    onlineUsers[data] = {
      socket: socket,
      state: true
    }
  })

  socket.on("disconnect-user", function (data) {
    onlineUsers[data] = {
      socket: null,
      state: false
    }
  })

  socket.on('send:message', function (data) {
    console.log(data)
    if ((data.to in onlineUsers) && onlineUsers[data.to].socket) {
      console.log(data)
      console.log("emit receive:message - ", data.to)
      onlineUsers[data.to].socket.emit("receive:message", data)
      onlineUsers[data.to].socket.emit("receive:message-contact", data)
    } else {
      console.log("can not find socket user")
    }
  })

  socket.on("newMessage", function (data) {
    console.log("new message arrived", data);
  });
});
