const router = require("express").Router();

const {
  login,
  register,
  refreshToken,
  updatePassword,
} = require("../services/User");
const upload = require("../handlers/Multer");

router.post("/auth/login", Login);
router.post("/auth/register", Register);
router.post("/auth/refresh_token", RefreshToken);
router.post("/auth/update-password", UpdatePassword);

function Login(req, res, next) {
  console.log("login");
  login(req.body)
    .then((user) => res.status(200).send(user))
    .catch((message) => res.status(400).send({ message }));
}

function Register(req, res, next) {
  console.log("register");
  register(req)
    .then((user) => res.send(user))
    .catch((message) => res.status(400).send({ message }));
}

function RefreshToken(req, res, next) {
  console.log("refresh token");
  refreshToken(req)
    .then((r) => res.send(r))
    .catch((message) => res.status(400).send({ message }));
}

function UpdatePassword(req, res, next) {
  console.log("update-password");

  updatePassword(req)
    .then((r) => res.send(r))
    .catch((message) => res.status(400).send({ message }));
}

module.exports = router;
