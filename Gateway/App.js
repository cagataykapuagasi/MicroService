require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const bodyParser = require("body-parser");
const port = process.env.PORT || 8000;
const Api = require("./routes");
const { jwtHandler, options } = require("./handlers/Jwt");
const proxy = require("http-proxy-middleware");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use(jwtHandler);

const userServiceProxy = proxy(options);
app.use("/api/user", userServiceProxy);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api", Api);

app.all("*", (req, res) => {
  res.status(404).send({ message: "Not Found" });
});

server.listen(port, () => {
  console.log(`Running Port: ${port}`);
});
