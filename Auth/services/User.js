const db = require("../db/db");
const User = db.User;
const { userHandler } = require("../handlers/Data");
const language = require("../translations");
const { updatePasswordErrors } = require("../handlers/ErrorHandler");

module.exports = {
  login,
  register,
  updatePassword,
};

async function login({ username, password }) {
  return new Promise(async (resolve, reject) => {
    const user = await User.findOne({ username });
    console.log("password", password);

    if (user && user.validPassword(password)) {
      const data = userHandler(user);

      resolve(data);
    } else if (user) {
      console.log(user);
      reject({
        password: language[(user && user.language) || "en"].login.password,
      });
    }

    reject({
      username: language[(user && user.language) || "en"].login.username,
    });
  });
}

async function register(req) {
  const { body } = req;

  if (body?.password?.length < 6) {
    return Promise.reject("Password must not be less than 6 characters");
  }
  try {
    const user = new User(body);
    user.setPassword(body.password);
    await user.save();
    const data = userHandler(user);
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error.message);
  }
}

async function updatePassword(req) {
  const {
    body: { password, new_password },
    headers: { id },
  } = req;

  try {
    const user = await User.findById(id);
    console.log("password", password);

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
