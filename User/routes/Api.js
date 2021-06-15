const router = require("express").Router();

const {
  addUser,
  getUser,
  getRandomUser,
  search,
  updateUser,
  updatePhoto,
  remove,
  addFriend,
  blockUser,
  getNearbyUsers,
} = require("../services/User");
const upload = require("../handlers/Multer");

router.post("/user/add", AddUser);
router.get("/user/random", GetRandomUser);
router.get("/user/search", Search);
router.get("/user/nearby", GetNearbyUsers);
router.get("/user/profile", GetUser);
router.delete("/user/profile", Remove);
router.post("/user/profile/update", UpdateUser);
router.post("/user/profile/update-photo", upload.single("photo"), UpdatePhoto);
router.post("/user/profile/friend", AddFriend);
router.post("/user/profile/block", BlockUser);

function AddUser(req, res, next) {
  console.log("add-user");
  addUser(req)
    .then((user) => res.status(200).send(user))
    .catch((message) => res.status(400).send({ message }));
}

function GetUser(req, res, next) {
  console.log("get user");
  getUser(req)
    .then((user) => res.send(user))
    .catch((message) => res.status(404).send({ message }));
}

function GetRandomUser(req, res, next) {
  console.log("get random user");
  getRandomUser(req)
    .then((user) => res.send(user))
    .catch((message) => res.status(404).send({ message }));
}

function Search(req, res, next) {
  console.log("search");
  search(req)
    .then((users) => res.send(users))
    .catch((message) => res.status(400).send({ message }));
}

function UpdateUser(req, res, next) {
  console.log("update-about");

  updateUser(req)
    .then((r) => res.send(r))
    .catch((message) => res.status(400).send({ message }));
}

function UpdatePhoto(req, res, next) {
  console.log("update photo", req.file);
  console.log("headers photo", req.headers);

  updatePhoto(req)
    .then((r) => res.send(r))
    .catch((message) => res.status(400).send({ message }));
}

function Remove(req, res, next) {
  remove(req)
    .then((r) => res.send(r))
    .catch((message) => res.status(404).send({ message }));
}

function AddFriend(req, res, next) {
  console.log("add friend");
  addFriend(req)
    .then((user) => res.send(user))
    .catch((message) => res.status(400).send({ message }));
}

function GetNearbyUsers(req, res, next) {
  console.log("get nearby");
  getNearbyUsers(req)
    .then((user) => res.send(user))
    .catch((message) => res.status(400).send({ message }));
}

function BlockUser(req, res, next) {
  console.log("block user");
  blockUser(req)
    .then((user) => res.send(user))
    .catch((message) => res.status(400).send({ message }));
}

module.exports = router;
