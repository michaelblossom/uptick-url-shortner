const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  // user: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: "User",
  //   required: [true, "Url must be posted by a User"],
  // },
  urlCode: String,
  longUrl: String,
  shortUrl: String,
  date: { type: String, default: Date.now() },
  numeViews: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Url", urlSchema);
