const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose.set("useFindAndModify", false);
// let uri =
//   "mongodb+srv://root:intriguing@cluster0.jcsfs.mongodb.net/chatdata?retryWrites=true&w=majority";
let uri =
  "mongodb://localhost:27017/ChatDB";
mongoose.connect(uri, {
  autoIndex: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  // other options
});
mongoose.connection
  .once("open", function () {
    console.log("-- [ MongoDB ] CONNECTION SUCCESSFUL --");
  })
  .on("error", function (error) {
    console.log("-- [ MongoDB ] CONNECTION ERROR :", error);
  });
