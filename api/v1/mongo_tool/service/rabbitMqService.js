const { execSync } = require("child_process");
const restore = require("mongodb-restore-dump");
const path = require("path");
const myInstance = require("../../../../services/rabbitMQ.service");
const { dumpQueue, restoreQueue } = require("../../../../utils/config");

//dump database using rabbit mq
exports.dumpRabbitMQ = async (dumpCollections, dumpDbUri) => {
  try {
    console.log({ dumpCollections });
    //queue
    let queue = dumpQueue;

    //create channel
    console.log({ myInstance });
    const channel = await myInstance.client.createChannel();
    console.log({ channel });
    //create queue
    await channel.assertQueue(queue, { durable: true });

    //publish dumpCollection
    for (const dumpCollection of dumpCollections) {
      // publisher
      channel.sendToQueue(queue, Buffer.from(dumpCollection));
    }

    //set time
    const options = {
      timeout: 1800000, // 30 minutes
    };

    //consumer
    channel.consume(
      queue,
      (publishedData) => {
        const dumpCollection = publishedData.content.toString();
        console.log({ dumpCollection });
        const command = `mongodump --uri ${dumpDbUri} --collection ${dumpCollection} --out ./dumpFile/`;
        execSync(command, options, (err) => {
          if (err) throw err;
        });
      },
      { noAck: true }
    );
  } catch (err) {
    console.log(err);
    return { message: err.message, status: false };
  }
};

//restore database
exports.restoreRabbitMQ = async (uri, selectedFolder) => {
  try {
    const data = uri + "|" + selectedFolder;

    //queue
    let queue = restoreQueue;

    //create channel
    const channel = await myInstance.client.createChannel();
    //create queue
    await channel.assertQueue(queue, { durable: true });

    // publisher
    channel.sendToQueue(queue, Buffer.from(data));

    //consumer
    channel.consume(
      queue,
      async (data) => {
        const publishedData = data.content.toString();
        const selectedFolder = publishedData.split("|");
        const getDatabaseName = selectedFolder[0].split("/");

        await restore.database({
          uri,
          database: getDatabaseName[3],
          from: path.resolve("dumpFile", selectedFolder[1]),
          dropCollections: true,
          metadata: true,
          jsonArray: true,
          verbose: true,
        });
      },
      { noAck: true }
    );
  } catch (err) {
    console.log(err);
    return { message: err.message, status: false };
  }
};
