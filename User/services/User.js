const fs = require("fs");
const db = require("../db/db");
const User = db.User;
const {
  userHandler,
  getRandomNumber,
  userHandlerWithoutToken,
  FriendHandler,
} = require("../handlers/Data");
const {
  userErrors,
  registerErrors,
  updatePasswordErrors,
} = require("../handlers/ErrorHandler");
const language = require("../translations");

module.exports = {
  addUser,
  getUser,
  getRandomUser,
  search,
  setFcm,
  updateAbout,
  updatePhoto,
  updateLanguage,
  remove,
  addFriend,
};

async function addUser(req) {
  const {
    body: { id, ...body },
  } = req;

  console.log(body);
  try {
    const user = new User({ ...body, _id: id });
    await user.save();
    return Promise.resolve(userHandler(user));
  } catch (error) {
    return Promise.reject(error.message);
  }
}

async function addFriend(req) {
  const { body } = req;

  if (req?.headers?.id === body.id) {
    return Promise.reject("Cannot add friend yourself");
  }

  try {
    const user = await User.findById(req?.headers?.id);
    const friend = await User.findById(body.id);
    if (!friend) {
      return Promise.reject("Not found");
    }

    if (user.friends.find((f) => f.id === body.id)) {
      return Promise.reject("Friend already added");
    }

    user.friends.push(FriendHandler(friend));
    await user.save();
    return Promise.resolve(user.friends);
  } catch (error) {
    return Promise.reject(error.message);
  }
}

async function getUser(req) {
  console.log(req.headers);
  const user = await User.findById(req?.headers?.id);

  if (user) {
    return Promise.resolve(userHandlerWithoutToken(user));
  }

  return Promise.reject("User not found.");
}

async function getRandomUser({ userData: { id } }) {
  let users = await User.find(
    {
      _id: { $ne: id },
      status: true,
    },
    { salt: 0, hash: 0 }
  );

  const user = users[getRandomNumber(users.length - 1)];
  return Promise.resolve(user);
}

async function updateAbout({ body: { about }, userData: { id } }) {
  try {
    const user = await User.findById(id);
    user.about = about;
    await user.save();
    return Promise.resolve({ message: "About was successfully updated." });
  } catch ({ message }) {
    return Promise.reject(message);
  }
}

async function updatePhoto(req) {
  const {
    userData: { id },
    file: { path },
  } = req;
  const url = `https://${req.get("host")}/${path}`;

  try {
    const user = await User.findById(id);

    console.log("path", user.profile_photo);
    if (user.profile_photo) {
      try {
        fs.unlinkSync(
          user.profile_photo.replace(`https://${req.get("host")}/`, "")
        );
      } catch (error) {
        console.log(error);
      }
    }

    user.profile_photo = url;
    await user.save();
    return Promise.resolve({ message: "Photo was successfully saved." });
  } catch ({ message }) {
    return Promise.reject(message);
  }
}

async function updateLanguage({ userData: { id }, body: { language } }) {
  try {
    const user = await User.findById(id);
    if (!["tr", "en"].includes(language)) {
      return Promise.reject(
        "Unsupported language.(Supported languages: tr, en)"
      );
    }

    user.language = language;
    await user.save();
    return Promise.resolve({ message: "Language was successfully updated." });
  } catch ({ message }) {
    return Promise.reject(message);
  }
}

async function remove(req) {
  User.findByIdAndDelete(req.userData.id)
    .then(() => Promise.resolve("User was deleted."))
    .catch(({ message }) => Promise.reject(message));
}

async function search({ body: { username }, userData: { id } }) {
  return User.find(
    {
      username: { $regex: username, $options: "i" },
      _id: { $ne: id },
    },
    { salt: 0, hash: 0 }
  );
}

async function setFcm({ body: { fcm }, userData: { id } }) {
  try {
    const user = await User.findById(id);
    user.fcm = fcm;
    await user.save();
    return Promise.resolve({ message: "Fcm was successfully updated." });
  } catch ({ message }) {
    return Promise.reject(message);
  }
}
