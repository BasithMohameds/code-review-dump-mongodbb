module.exports = {
  baseUrl: process.env.APP_DATABASE_URI,
  dumpQueue: "dump-bulk-collection",
  restoreQueue: "restore-bulk-collection",
};
