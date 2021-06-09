const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const friendSchema = new Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true,
      required: [true, "can't be blank"],
    },
  },
  { timestamps: true }
);

const schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, "can't be blank"],
      index: true,
      minlength: 3,
    },
    profile_photo: { type: String, default: null },
    status: { type: Boolean, default: false },
    language: { type: String, default: "en", maxlength: 2 },
    fcm: { type: String, default: null },
    about: { type: String, default: "Available", maxlength: 15 },
    email: {
      type: String,
      unique: true,
      required: [true, "can't be blank"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      index: true,
    },
    friends: { type: Array },
    blockedUsers: { type: Array },
  },
  { timestamps: true }
);

schema.plugin(uniqueValidator, { message: "is already taken." });

schema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", schema);
