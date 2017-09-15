let config;

if (process.env.NODE_ENV === 'development') {
  config = {
    address: '127.0.0.1:5672',
    userName: 'guest',
    password: 'guest',
    exchange: 'xgic.topic',
    queue: 'queue.xgic.topic',
    publisherRoutingKey: 'xgic.business',
    receiverRoutingKey: 'xgic.facade',
    exchangeType: 'topic',
    virtualHost: 'xgic'
  };
} else {
  config = {
    address: process.env.MQ_ADDRESS || '127.0.0.1:5672',
    userName: process.env.MQ_USERNAME || 'guest',
    password: process.env.MQ_PASSWORD || 'guest',
    exchange: 'xgic.topic',
    queue: 'queue.xgic.topic',
    routingKeyPrefix: 'xgic.facade',
    exchangeType: 'topic',
    virtualHost: 'xgic'
  };
}

module.exports = config;
