require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const bodyParser = require("body-parser");
const port = process.env.PORT || 8000;
const Api = require("./routes");
const { jwtHandler, options } = require("./handlers/Jwt");
const proxy = require("http-proxy-middleware");
const { userApi } = require("./handlers/axios");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(jwtHandler);

const userServiceProxy = proxy(options);

app.use("/api", Api);
app.use(userServiceProxy);

app.all("*", (req, res) => {
  res.status(404).send({ message: "Not Found" });
});

server.listen(port, () => {
  console.log(`Running Port: ${port}`);
});
