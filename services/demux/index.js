const { BaseActionWatcher } = require("demux");
const { NodeosActionReader } = require("demux-eos");
const ActionHandler = require("./ActionHandler");
const handlerVersion = require("./handlerVersions/v1");

const actionHandler = new ActionHandler([handlerVersion]);
const actionReader = new NodeosActionReader(
  // original v1.3 testnet: http://localhost:7777
  // gitpod v2.0 testnet: "https://8000-d98ffe18-8038-4b14-9af3-5bc105bc441c.ws-us02.gitpod.io",
  "http://localhost:8888", // Blockchain
  0,
);

const actionWatcher = new BaseActionWatcher(
  actionReader,
  actionHandler,
  250,
);

console.log("\nCONNECTED TO EOS TESTNET RUNNING AT:\nEOS BLOCKCHAIN HTTP ENDPOINT GOES HERE\n");

module.exports = actionWatcher;
