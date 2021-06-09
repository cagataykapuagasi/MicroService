require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const bodyParser = require("body-parser");
const port = process.env.PORT || 8000;
const Api = require("./routes");
const jwt = require("./handlers/Jwt");
const axios = require("axios");

const authApi = axios.create({
  baseURL: "baseURL",
});

const userApi = axios.create({
  baseURL: "baseURL",
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(jwt);

app.use("/api", Api);

app.all("*", (req, res) => {
  res.status(404).send({ message: "Not Found" });
});

server.listen(port, () => {
  console.log(`Running Port: ${port}`);
});
