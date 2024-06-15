const http = require("http");
const { Router } = require("./routers.js");
const { RestService } = require("./rest_service.js");
const dotenv = require("dotenv");
const { connection } = require("./db/connectDb.js");
const { createUserTable } = require("./models/userModel.js");

dotenv.config({
  path: ".env",
});

const router = new Router();
const restService = new RestService(router);

const server = http.createServer();
server.on("request", restService.init());

connection.connect((err) => {
  if (err) {
    console.log("Error connecting to MySQL database:", err.message);
    return;
  }
  console.log("Connected to MySQL database");

  createUserTable(connection);

  server.listen(process.env.PORT, () => {
    console.log("server running at " + process.env.PORT);
  });
});
