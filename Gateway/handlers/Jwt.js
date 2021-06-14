const jwt = require("jsonwebtoken");
const { userApi, authApi } = require("./axios");

const options = {
  target: "http://localhost:8002",
  changeOrigin: true,
  secure: false,
  ws: true,
  headers: {},
};

jwtHandler = (req, res, next) => {
  const { path } = req;

  if (!path.includes("api/user")) {
    next();
    return;
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.API_SECRET);
    Object.keys(decoded).map((key) => {
      userApi.defaults.headers[key] = decoded[key];
      authApi.defaults.headers[key] = decoded[key];
      options.headers[key] = decoded[key];
    });
    req.userData = decoded;
    next();
  } catch ({ message }) {
    if (message === "jwt expired") {
      res.status(401).send({ message: "Token was expired." });
    } else {
      res.status(401).send({ message: "Unauthorized." });
    }
  }
};

module.exports = {
  options,
  jwtHandler,
};
