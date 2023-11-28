const amqplib = require('amqplib');
const { RABBITMQ_URL, ORDER_QUEUE_NAME } = require('./const');

let brokerConnection;
let orderChannel;

const registerOrder = async (req, res) => {
  if (!brokerConnection || !orderChannel) {
    brokerConnection = await amqplib.connect(RABBITMQ_URL);
    orderChannel = await brokerConnection.createChannel();
  }

  await orderChannel.assertQueue(ORDER_QUEUE_NAME);

  const order = JSON.stringify(req.body);

  orderChannel.sendToQueue(ORDER_QUEUE_NAME, Buffer.from(order));

  res.send('Заказ передан в обработку!');
};

module.exports = registerOrder;
