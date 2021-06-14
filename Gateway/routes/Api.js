const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { authApi, userApi } = require("../handlers/axios");
const axios = require("axios");

router.post("/auth/login", Auth);
router.post("/auth/register", Register);
router.post("/auth/update-password", UpdatePassword);

async function Auth(req, res, next) {
  try {
    const { data } = await authApi.post("auth/login", req.body);
    const token = generateJWT({
      id: data.user.id,
      username: data.user.username,
    });
    console.log(data);
    return res.status(200).send({ ...data, token });
  } catch (error) {
    res.status(400).send(error.response.data);
  }
}

async function Register(req, res, next) {
  try {
    const { data } = await authApi.post("auth/register", req.body);
    const { data: userData } = await userApi.post("user/add", {
      ...req.body,
      id: data.user.id,
    });

    res.status(200).send({ data: { ...data, ...userData } });
  } catch (error) {
    res.status(400).send(error.response.data);
  }
}

async function UpdatePassword(req, res, next) {
  try {
    const { data } = await authApi.post("auth/update-password", req.body);

    return res.status(200).send(data);
  } catch (error) {
    res.status(400).send(error.response.data);
  }
}

function generateJWT({ id, username }) {
  return jwt.sign(
    {
      id,
      username,
    },
    process.env.API_SECRET
    //{ expiresIn: process.env.TOKEN_EXPIRE }
  );
}

module.exports = router;
