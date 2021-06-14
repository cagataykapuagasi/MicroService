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
var geodist = require("geodist");

module.exports = {
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
    user.blocked_users = user.blocked_users.filter(
      (item) => item.id !== friend.id
    );
    await user.save();
    return Promise.resolve(user.friends);
  } catch (error) {
    return Promise.reject(error.message);
  }
}

async function getNearbyUsers(req) {
  const {
    body,
    query: { range = 5000 },
  } = req;

  // if (req?.headers?.id === body.id) {
  //   return Promise.reject("Cannot add friend yourself");
  // }

  try {
    const user = await User.findById(req?.headers?.id);
    const users = await User.find(
      {
        _id: { $ne: req?.headers?.id },
      },
      { salt: 0, hash: 0 }
    );
    const targetLocation = user.toJSON().location;

    const findedUsers = users.map((item) => {
      const distance = geodist(
        { lat: targetLocation.latitude, lon: targetLocation.longitude },
        { lat: item.location.latitude, lon: item.location.longitude }
      );

      if (distance <= range) {
        const user = userHandlerWithoutToken(item);
        user.distance = distance;
        return user;
      }
    });

    return Promise.resolve(findedUsers);
  } catch (error) {
    return Promise.reject(error.message);
  }
}

async function blockUser(req) {
  const { body } = req;

  if (req?.headers?.id === body.id) {
    return Promise.reject("Cannot block yourself");
  }

  try {
    const user = await User.findById(req?.headers?.id);
    const blockedUser = await User.findById(body.id);
    if (!blockedUser) {
      return Promise.reject("Not found");
    }

    if (user.blocked_users.find((f) => f.id === body.id)) {
      return Promise.reject("User already blocked");
    }

    user.blocked_users.push(FriendHandler(blockedUser));
    user.friends = user.friends.filter((item) => item.id !== blockedUser.id);
    await user.save();
    return Promise.resolve(user.blocked_users);
  } catch (error) {
    return Promise.reject(error.message);
  }
}

async function getUser(req) {
  console.log(req.headers);
  const user = await User.findById(req?.headers?.id);
  console.log(user);
  if (user) {
    return Promise.resolve(userHandlerWithoutToken(user));
  }

  return Promise.reject("User not found.");
}

async function getRandomUser({ headers: { id } }) {
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

async function updateUser(req) {
  const {
    body: { profile_photo, fcm, friends, blocked_users, id, ...other },
  } = req;

  console.log(other);
  try {
    const user = await User.findById(req?.headers?.id);
    const newUser = { ...user.toJSON(), ...other };
    console.log(newUser);
    await user.update(newUser);
    return Promise.resolve({ message: "User was successfully updated." });
  } catch ({ message }) {
    return Promise.reject(message);
  }
}

async function updatePhoto(req) {
  const {
    headers: { id },
    file: { path },
  } = req;
  const url = `https://${req.get("host")}/${path}`;
  console.log(id);

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

async function updateLanguage({ headers: { id }, body: { language } }) {
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
  User.findByIdAndDelete(req.headers.id)
    .then(() => Promise.resolve("User was deleted."))
    .catch(({ message }) => Promise.reject(message));
}

async function search({ headers: { id }, query: { value } }) {
  return User.find(
    {
      username: { $regex: value, $options: "i" },
      _id: { $ne: id },
    },
    { salt: 0, hash: 0 }
  );
}

async function setFcm({ body: { fcm }, headers: { id } }) {
  try {
    const user = await User.findById(id);
    user.fcm = fcm;
    await user.save();
    return Promise.resolve({ message: "Fcm was successfully updated." });
  } catch ({ message }) {
    return Promise.reject(message);
  }
}
