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
const geodist = require("geodist");

module.exports = {
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

  try {
    const user = await User.findById(req?.headers?.id);
    const users = await User.find(
      {
        _id: { $ne: req?.headers?.id },
      },
      { salt: 0, hash: 0 }
    );
    const targetLocation = user.toJSON().location;
    const findedUsers = [];
    users.forEach((item) => {
      const distance = geodist(
        { lat: targetLocation.latitude, lon: targetLocation.longitude },
        { lat: item.location.latitude, lon: item.location.longitude }
      );

      if (distance <= range) {
        const user = userHandlerWithoutToken(item);
        user.distance = distance;
        findedUsers.push(user);
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
  const user = await User.findById(req?.headers?.id);
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
    body: { profile_photo, friends, blocked_users, id, ...other },
  } = req;

  try {
    const user = await User.findById(req?.headers?.id);
    const newUser = { ...user.toJSON(), ...other };
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
  const url = `http://${req.get("host")}/${path}`;

  try {
    const user = await User.findById(id);

    if (user.profile_photo) {
      try {
        fs.unlinkSync(
          user.profile_photo.replace(`http://${req.get("host")}/`, "")
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

async function remove(req) {
  User.findByIdAndDelete(req.headers.id)
    .then(() => Promise.resolve("User was deleted."))
    .catch(({ message }) => Promise.reject(message));
}

async function search({ headers: { id }, query: { value } }) {
  const users = await User.find(
    {
      username: { $regex: value, $options: "i" },
      _id: { $ne: id },
    },
    { salt: 0, hash: 0, __v: 0 }
  );

  return users.map((item) => userHandlerWithoutToken(item));
}
