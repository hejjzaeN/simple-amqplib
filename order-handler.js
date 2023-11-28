const cluster = require('cluster');
const os = require('os');
const amqplib = require('amqplib');
const { RABBITMQ_URL, ORDER_QUEUE_NAME } = require('./const');

(async () => {
  let brokerConnection = await amqplib.connect(RABBITMQ_URL);
  let orderChannel;

  const delay = async () => {
    return new Promise(resolve => setTimeout(resolve, 5000));
  }

  const handleOrder = async () => {
    if (!brokerConnection || !orderChannel) {
      brokerConnection = await amqplib.connect(RABBITMQ_URL);
      orderChannel = await brokerConnection.createChannel();
    }

    await orderChannel.assertQueue(ORDER_QUEUE_NAME);

    orderChannel.consume(ORDER_QUEUE_NAME, async (order) => {
      if (!order) {
        console.log('Consumer cancelled by server');
      } else {
        console.log(`I got ${ order.content.toString() }`);
        // Имитация тяжелых вычислений
        await delay();
        console.log('Вычисление окончено!');
        orderChannel.ack(order);
      }
    });
  };

  if (cluster.isMaster) {
    const cpus = os.cpus().length;

    for (let i = 0; i <= cpus; i++) cluster.fork();

    cluster.on('fork', worker => {
      console.log(
        `Worker ${ worker.id } launched`
      );
    });

    cluster.on('exit', (worker, code) => {
      console.log(
        `Worker ${ worker.id } finished. Exit code: ${ code }`
      );

      handleOrder();
    })
  } else {
    handleOrder();
  }
})();
