const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
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
