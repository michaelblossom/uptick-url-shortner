const express = require("express");

const validUrl = require("valid-url");
const shortid = require("shortid");
const config = require("config");

//@ route POST /api/url/shorten
//@desc Create short URL

const Url = require("../models/url");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const router = express.Router();

exports.creatUrl = catchAsync(async (req, res, next) => {
  const { longUrl } = req.body;
  const baseUrl = config.get("baseUrl");

  //check base url
  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).json("invalid base uri");
  }

  //create uri code
  const urlCode = shortid.generate();

  // check long url
  if (validUrl.isUri(longUrl)) {
    try {
      let url = await Url.findOne({ longUrl: longUrl });

      if (url) {
        res.json(url);
      } else {
        const shortUrl = baseUrl + "/" + urlCode;

        url = new Url({
          longUrl,
          shortUrl,
          urlCode,
          date: new Date(),
        });

        // saving the url to the database
        await url.save();

        res.json(url);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json("Server error");
    }
  } else {
    //if ulr is not valid
    res.status(401).json("Invalid long url");
  }
});

// get All url
exports.getAllUrls = catchAsync(async (req, res, next) => {
  const urls = await Url.find();
  // sending response
  res.status(200).json({
    status: "success",
    result: urls.length,
    data: {
      urls,
    },
  });
});

//get url
exports.getUrl = catchAsync(async (req, res, next) => {
  const url = await Url.findOne({ urlCode: req.params.code });
  if (!url) {
    const error = new AppError("No url found with this ID", 404);

    // console.log(error.)
    return next(error);
  }
  await Url.findOneAndUpdate(
    { urlCode: req.params.code },
    {
      $inc: { numeViews: 1 }, //this logic will increase the value of numView filed to by 1
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    data: {
      url: url,
    },
  });
});

// update order
exports.updateUrl = catchAsync(async (req, res, next) => {
  const url = await Url.findOneAndUpdate(
    { urlCode: req.params.code },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!url) {
    return next(new AppError("No order found with this ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      url,
    },
  });
});

exports.deleteUrl = catchAsync(async (req, res, next) => {
  const url = await Url.findOneAndDelete(req.params.code);
  if (!url) {
    return next(new AppError("No url found with this urlCode", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
