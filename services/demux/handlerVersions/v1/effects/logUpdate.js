function logUpdate(payload, blockInfo, context) {
  console.info("State updated:\n", JSON.stringify(context.stateCopy, null, 2));
}

module.exports = logUpdate;
