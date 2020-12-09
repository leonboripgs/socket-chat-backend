function parseTokenString(tokenString) {
  const [amountString, symbol] = tokenString.split(" ")
  const amount = parseFloat(amountString)
  return { amount, symbol };
}

function updateTransferData(state, payload, blockInfo, context) {
  console.log("\n\nTOKEN TRANSACTION DETECTED WITH TX PAYLOAD:");
  console.log(payload);
  console.log("\n\nTransaction amount:");
  console.log(payload.data.quantity);
  console.log("\n\nblockInfo:");
  console.log(blockInfo);
  const { amount, symbol } = parseTokenString(payload.data.quantity);
  if (!state.volumeBySymbol[symbol]) {
    state.volumeBySymbol[symbol] = amount;
  } else {
    state.volumeBySymbol[symbol] += amount;
  }
  state.totalTransfers += 1;
  context.stateCopy = JSON.parse(JSON.stringify(state));
}

module.exports = updateTransferData;
