const amqp = require('amqplib/callback_api');

const config = require('../config/rabbitmq');
const logger = require('../config/logger');

const getRoutingKey = (prefix, topic) => {
  if (!topic) {
    throw new Error('invalid topic');
  }
  if (prefix) {
    return `${prefix}.${topic}`;
  }
  return topic;
};

const createMessagePublisher = () => {

  const publisher = {};

  const {address, userName, password} = config;
  const url = `amqp://${userName}:${password}@${address}`;
  amqp.connect(url, (err, conn) => {
    if (err) {
      console.error(err);
      return;
    }

    conn.createConfirmChannel((err, ch) => {
      if (err) {
        logger.error(err);
        return;
      }

      const {exchange, publisherRoutingKey, exchangeType} = config;

      ch.assertExchange(exchange, exchangeType, {});

      publisher.publish = (msg) => {
        const routingKey = getRoutingKey(publisherRoutingKey, msg.topic);

        const serializedMsg = JSON.stringify(msg);

        ch.publish(exchange, routingKey, new Buffer(serializedMsg), {}, (err) => {
          if (err) {
            logger.error(err);
          } else {
            logger.debug(`msg sent. routingKey: ${routingKey}, msg: ${serializedMsg}`);
          }
        });
      };

      publisher.close = () => {
        if (ch) {
          ch.close();
        }
        if (conn) {
          conn.close();
        }
      };
    });
  });

  return publisher;
};

module.exports = createMessagePublisher;
