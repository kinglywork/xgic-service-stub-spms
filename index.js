/**
 * Created by xiaoling on 16/08/2017.
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const logger = require('./config/logger');

const express = require('./config/express');
const env = require('./config/env');
const mqConfig = require('./config/rabbitmq');

const app = express.init();

const builder = require('./src');
const publisher = builder.createMessagePublisher();
const receiver = builder.createMessageReceiver({logger});

const models = ['report', 'component', 'complaint'];
const {receiverRoutingKey} = mqConfig;
models.forEach(model => {
  receiver.registerHandler(model, receiverRoutingKey, (msg, ack) => {
    if (ack) {
      ack(msg);
    }

    const json = JSON.parse(msg.content.toString());
    const newData = {
      id: json.data.id,
      topic: json.topic,
      data: json.data
    };

    publisher.publish(newData);
  });
});

receiver.run();

const exitHandler = (reason) => {
  publisher.close();
  const reasons = Object.keys(reason).join(',');
  logger.info(`server stop because: ${reasons}`)
};
process.on('exit', exitHandler.bind(null, {cleanup: true}));
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));

app.listen(env.port, () => {
  logger.info(`stub service started with [${process.env.NODE_ENV}] environment...`);
});






