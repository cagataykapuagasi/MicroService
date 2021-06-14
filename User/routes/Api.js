const router = require("express").Router();

const {
  addUser,
  getUser,
  getRandomUser,
  search,
  setFcm,
  updateUser,
  updatePhoto,
  updateLanguage,
  remove,
  addFriend,
  blockUser,
  getNearbyUsers,
} = require("../services/User");
const upload = require("../handlers/Multer");

router.post("/user/add", AddUser);
router.get("/user/random", GetRandomUser);
router.post("/user/search", Search);
router.post("/user/fcm", SetFcm);
router.get("/user/profile", GetUser);
router.post("/user/profile/update", UpdateUser);
router.post("/user/profile/update-photo", upload.single("photo"), UpdatePhoto);
router.post("/user/profile/update-language", UpdateLanguage);
router.delete("/user/profile", Remove);
router.post("/user/friends", AddFriend);
router.post("/user/block", BlockUser);
router.get("/user/nearby", GetNearbyUsers);

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

function UpdateLanguage(req, res, next) {
  console.log("update language");
  updateLanguage(req)
    .then((r) => res.send(r))
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

function SetFcm(req, res, next) {
  console.log("set fcm");
  setFcm(req)
    .then((r) => res.send(r))
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
