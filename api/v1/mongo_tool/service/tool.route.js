const express = require("express");
const toolRoute = express.Router();

const { catchAsync } = require("../../../../services/service");

const {
  mongodbDump,
  mongodbRestore,
  getFolderName,
} = require("./tool.service");

// 1 dump api
toolRoute.post("/dump", catchAsync(mongodbDump));

// 2 restore api
toolRoute.post("/restore", catchAsync(mongodbRestore));

// 3 get folderName
toolRoute.get("/getDatabaseName", catchAsync(getFolderName));

module.exports = toolRoute;
