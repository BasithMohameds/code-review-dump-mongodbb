const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { baseUrl } = require("./utils/config");

// Rabbit MQ Connection
const myInstance = require("./services/rabbitMQ.service");
(async () => {
  const connection = await myInstance.connection();
  if (connection instanceof Error || connection.errno === -3008) {
    console.log("Rabbit MQ Connection failed..!");
    // throw new Error("Rabbit MQ Connection failed..!");
  } else {
    console.log("Rabbit MQ Connected..!");
  }
})();

const toolRoute = require("./api/v1/mongo_tool/service/tool.route");

//Database Connection
mongoose
  .connect(baseUrl, { useNewUrlParser: true })
  .then(() => console.log("Database connected successfully!"))
  .catch((err) => console.error(err));

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploadfiles", express.static("uploadfiles"));

app.use("/mongodb-tool", toolRoute);

app.get("/", function (req, res) {
  res.send("TestCase Home Page");
});

app.listen(8000, () => {
  console.log("server started..!");
});
