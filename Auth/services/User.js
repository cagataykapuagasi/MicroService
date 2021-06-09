const db = require("../db/db");
const User = db.User;
const { userHandler } = require("../handlers/Data");
const language = require("../translations");
const {
  userErrors,
  registerErrors,
  updatePasswordErrors,
} = require("../handlers/ErrorHandler");

module.exports = {
  login,
  register,
  refreshToken,
  updatePassword,
};

async function login({ username, password }) {
  return new Promise(async (resolve, reject) => {
    const user = await User.findOne({ username });

    if (user && user.validPassword(password)) {
      const data = userHandler(user);

      resolve(data);
    } else if (user) {
      reject({ password: language[user.language].login.password });
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

async function updatePassword(req) {
  const {
    body: { password, new_password },
    userData: { id },
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
