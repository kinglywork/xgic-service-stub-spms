const amqp = require('amqplib/callback_api');
const config = require('../config/rabbitmq');

const createMessageReceiver = ({logger}) => {
  const handlers = {};

  const registerHandler = (key, routingKeyPrefix, handler) => {
    let routingKey = key;
    if (key.indexOf(routingKeyPrefix) < 0) {
      routingKey = `${routingKeyPrefix}.${key}`
    }
    handlers[routingKey] = handler;
  };

  const run = () => {
    const {address, userName, password} = config;
    const url = `amqp://${userName}:${password}@${address}`;
    amqp.connect(url, (err, conn) => {
      if (err) {
        console.error(err);
        return;
      }

      conn.createChannel((err, ch) => {
        if (err) {
          logger.error(err);
          return;
        }

        const {exchange, queue, prefetch, exchangeType} = config;

        ch.prefetch(prefetch, true);

        ch.assertExchange(exchange, exchangeType, {}, (err) => {
          if (err) {
            logger.error(err);
            return;
          }

          logger.info(`assertExchange: ${exchange}`);
        });

        ch.assertQueue(queue, {}, (err) => {
          if (err) {
            logger.error(err);
            return;
          }

          logger.info(`assertQueue: ${queue}`);

          const {receiverRoutingKey} = config;
          const routingKey = `${receiverRoutingKey}.*`;
          ch.bindQueue(queue, exchange, routingKey);
          logger.info(`bind ${queue} with ${exchange} on ${routingKey}`);

          ch.consume(queue, (msg) => {
            const handler = handlers[msg.fields.routingKey];
            if (handler) {
              handler(
                msg,
                () => ch.ack(msg));
            } else {
              logger.info('no handler');
              ch.reject(msg);
            }
          });
        });
      });
    });
  };

  return {
    registerHandler,
    run
  };
};

module.exports = createMessageReceiver;
