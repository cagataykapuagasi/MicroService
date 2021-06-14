require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const bodyParser = require("body-parser");
const port = process.env.PORT || 8002;
const io = require("socket.io")(
  server,
  { origins: "*:*" },
  { transports: ["websocket", "polling", "flashsocket"] }
);
const Api = require("./routes");
const { Chat } = require("./services");

app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/socket", Chat(io));
app.use("/api", Api);

app.all("*", (req, res) => {
  console.log("not found", req.path);
  res.status(404).send({ message: "Not Found" });
});

server.listen(port, () => {
  console.log(`Running Port: ${port}`);
});
