const fs = require("fs");
const db = require("../db/db");
const User = db.User;
const {
  userHandler,
  getRandomNumber,
  userHandlerWithoutToken
} = require("../handlers/Data");
const {
  userErrors,
  registerErrors,
  updatePasswordErrors
} = require("../handlers/ErrorHandler");
const language = require("../translations");

module.exports = {
  login,
  getUser,
  getRandomUser,
  search,
  setFcm,
  register,
  refreshToken,
  updateAbout,
  updatePhoto,
  updatePassword,
  updateLanguage,
  remove
};

async function login({ username, password }) {
  return new Promise(async (resolve, reject) => {
    const user = await User.findOne({ username });

    if (user && user.validPassword(password)) {
      const token = user.generateJWT();
      user.generateRefreshToken();
      const data = userHandler(user, { token });

      await user.save();
      resolve(data);
    } else if (user) {
      reject({ password: language[user.language].login.password });
    }

    reject({
      username: language[(user && user.language) || "en"].login.username
    });
  });
}

async function getUser(req) {
  const user = await User.findById(req.userData.id);

  if (user) {
    return Promise.resolve(userHandlerWithoutToken(user));
  }

  return Promise.reject("User not found.");
}

async function refreshToken({ body: { refresh_token } }) {
  const user = await User.findOne({ refresh_token });

  if (user) {
    const token = user.generateJWT();
    const { refresh_token } = user.generateRefreshToken();

    await user.save();
    return Promise.resolve({ token, refresh_token });
  }

  return Promise.reject("refresh_token is incorrect");
}

async function getRandomUser({ userData: { id } }) {
  let users = await User.find(
    {
      _id: { $ne: id },
      status: true
    },
    { salt: 0, hash: 0 }
  );

  const user = users[getRandomNumber(users.length - 1)];
  return Promise.resolve(user);
}

async function register(req) {
  const { body } = req;

  if (body.password.length < 6) {
    return Promise.reject("Password must not be less than 6 characters");
  }
  try {
    const user = new User(body);
    user.setPassword(body.password);
    const token = user.generateJWT();
    user.generateRefreshToken();
    await user.save();
    const data = userHandler(user, { token });
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error.message);
  }
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
    file: { path }
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

async function updatePassword(req) {
  const {
    body: { password, new_password },
    userData: { id }
  } = req;

  try {
    const user = await User.findById(id);

    const error = updatePasswordErrors({ user, password, new_password });
    if (error) {
      return Promise.reject(error);
    }

    const hash = user.setPassword(new_password);
    Object.assign(user, hash);
    await user.save();
    return Promise.resolve({ message: "Password was updated." });
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
      _id: { $ne: id }
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
