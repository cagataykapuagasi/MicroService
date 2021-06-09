const axios = require("axios");

const authApi = axios.create({
  baseURL: "http://localhost:8001/api",
});

const userApi = axios.create({
  baseURL: "http://localhost:8002/api",
});

module.exports = { authApi, userApi };
