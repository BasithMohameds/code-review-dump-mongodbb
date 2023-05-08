const amqp = require("amqplib");

class MyClass {
  client;
  constructor() {}

  async connection() {
    try {
      this.client = await amqp.connect(`amqp://localhost`);
      // this.client = await amqp.connect(`amqp://we-api.digivalitsolutions.com`);
      // this.client = await amqp.connect({
      //   protocol: "amqp",
      //   hostname: "52.214.193.211",
      //   port: 49153,
      //   username: "guest",
      //   password: "guest",
      // });

      return this.client;
    } catch (err) {
      return err;
    }
  }
}

const myInstance = new MyClass();

module.exports = myInstance;
