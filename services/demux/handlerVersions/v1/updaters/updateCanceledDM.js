const MessageSchema = require("../../../../../schemas/message_schema")

function parseTokenString(tokenString) {
  const [amountString, symbol] = tokenString.split(" ")
  const amount = parseFloat(amountString)
  return { amount, symbol };
}

function updateCanceledDM(state, payload, blockInfo, context) {
  console.log("\n\nCANCELED DM TRANSACTION DETECTED WITH TX PAYLOAD:");
  console.log(payload);
  console.log("\n\nTransaction amount:");
  console.log(payload.data.quantity);
  console.log("\n\nblockInfo:");
  console.log(blockInfo);

  const {
    from,
    to,
    quantity,
    memo,
    msg_id,
  } = payload.data;

  const { amount, symbol } = parseTokenString(quantity);
  if (!state.volumeBySymbol[symbol]) {
    state.volumeBySymbol[symbol] = amount;
  } else {
    state.volumeBySymbol[symbol] += amount;
  }
  state.totalTransfers += 1;
  context.stateCopy = JSON.parse(JSON.stringify(state));

  MessageSchema.findById(msg_id, function(err, msg) {
    if(err) {
      console.error("There is no message with Id:", msg_id);
      return;
    }
    console.log(msg);
    msg.status = "canceled";
    msg.updated_at = Date.now();
    msg.save();
    console.log("==== Message Canceled ====");
    console.log(msg);
    console.log("--------------------------");
  })
}

module.exports = updateCanceledDM;
