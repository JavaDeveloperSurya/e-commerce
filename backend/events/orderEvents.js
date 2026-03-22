const EventEmitter = require("events");

class OrderEmitter extends EventEmitter {}

const orderEvents = new OrderEmitter();

module.exports = orderEvents;