const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

const fetch = require("node-fetch"); // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require("util"); // node only; native TextEncoder/Decoder
// [ MongoDB ] connection
require("./config/db_connection.js");

const AccountRouter = require("./modules/account/router");
const MessageRouter = require("./modules/dms/router");

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

const port = process.env.PORT || 5000;
const server = app.listen(port || 5000, () => {
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
    onlineUsers.hasKey
    if ((data.to in onlineUsers) && onlineUsers[data.to].socket) {
      console.log(data)
      console.log("emit receive:message - ", data.to)
      onlineUsers[data.to].socket.emit("receive:message", data)
    } else {
      console.log("can not find socket user")
    }
  })

  socket.on("newMessage", function (data) {
    console.log("new message arrived", data);
  });
});
