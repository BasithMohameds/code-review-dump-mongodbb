const { MongoClient } = require("mongodb");
const path = require("path");
const fs = require("fs");

const { uriValidation } = require("../../../../services/regex");
const { baseUrl } = require("../../../../utils/config");
const { dumpRabbitMQ, restoreRabbitMQ } = require("./rabbitMqService");

// 1 dump mongodb service
exports.mongodbDump = async ({ body = {} }) => {
  try {
    const { dumpDbUri } = body;
    const dumpDbUriCollections = []; //user dumpDbUri database collections
    const appCollections = []; //node app common database collections

    const validatedDumpUri = uriValidation(dumpDbUri);
    const getDatabaseName = dumpDbUri.split("/");
    const appUri = baseUrl.split("/");

    if (validatedDumpUri) {
      //user dumpDbUri database connection
      const userDumpUri = new MongoClient(dumpDbUri, { useNewUrlParser: true });
      userDumpUri.connect();

      //my app database connection
      const appDatabaseUri = new MongoClient(baseUrl, {
        useNewUrlParser: true,
      });
      appDatabaseUri.connect();

      //find dumpDbUriCollections collection name
      const getDumpDbUriCollections = await userDumpUri
        .db(getDatabaseName[3])
        .listCollections()
        .toArray();
      getDumpDbUriCollections.map((item) =>
        dumpDbUriCollections.push(item.name)
      );

      //empty database or no database
      if (!getDumpDbUriCollections.length)
        return { message: "Dump Failed", status: false };

      //find appCollections collection name
      const getAppCollections = await appDatabaseUri
        .db(appUri[3])
        .listCollections()
        .toArray();
      getAppCollections.map((item) => appCollections.push(item.name));

      const dumpCollections = dumpDbUriCollections.filter(
        (val) => !appCollections.includes(val)
      );

      dumpRabbitMQ(dumpCollections, dumpDbUri);

      return { message: "Backup Completed..!", status: true };
    } else return { message: "Dump Failed check uri...!", status: false };
  } catch (err) {
    console.log(err);
    return { message: err.message, status: false };
  }
};
// 2 restore database collections
exports.mongodbRestore = async ({ body = {} }) => {
  try {
    const { uri, selectedFolder } = body;

    const validatedDumpUri = uriValidation(uri);

    if (validatedDumpUri) {
      restoreRabbitMQ(uri, selectedFolder);

      return { message: "Restore Completed..!", status: true };
    } else return { message: "Restore Failed check uri...!", status: false };
  } catch (err) {
    console.log(err);
    return { message: err.message, status: false };
  }
};

// 3 get database name
exports.getFolderName = async () => {
  try {
    const FolderNames = fs.readdirSync(path.resolve("dumpFile"));
    console.log({ FolderNames });
    return { message: FolderNames, status: true };
  } catch (err) {
    console.log(err);
    return { message: err.message, status: false };
  }
};
