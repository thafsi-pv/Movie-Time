const userModel = require("../models/userModel");
const { comparePassword, generatePasswordHash } = require("../utils/bcrypt");
const { generateAccessToken } = require("../utils/jwt");
const { sendPasswordResetEmailNodeMail } = require("../utils/nodemailer");
const { generateVerificationCode } = require("../utils/verificationCode");

var PasscodeVerificationData = {};
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isUserExist = await userModel.findOne({ email });
    if (!isUserExist) {
      return res.status(400).json({ message: "Incorrect email/password" });
    }

    const validPassword = await comparePassword(password, isUserExist.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    //generate access token
    const accesstoken = generateAccessToken(isUserExist._id);
    return res.status(200).json({
      message: "Login success",
      accesstoken,
      email: isUserExist.email,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isExist = await userModel.findOne({ email });
    if (isExist) {
      res.status(400).json({
        message: "This email address has already been registered!. 😁",
      });
      return;
    }

    const hash = await generatePasswordHash(password);
    const newUser = await userModel.create({ ...req.body, password: hash });
    res.json(newUser);
  } catch (error) {
    console.log(error);
  }
};

const watchlater = async (req, res) => {
  try {
    const { page, pageSize } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(pageSize);
    const skipCount = (pageNumber - 1) * limitNumber;
    var movies = await userModel
      .find({ _id: req.userId })
      .select("movies")
      .populate({ path: "movies", populate: { path: "genre" } });

    const moviez = movies[0].movies;
    const data = moviez.slice(skipCount, skipCount + limitNumber);

    const totalCount = moviez.length;
    const totalPage = Math.ceil(totalCount / limitNumber);
    res.json({
      data,
      pageNumber,
      totalPage,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addtoWathclater = async (req, res) => {
  const userId = req.userId;
  const newList = await userModel.findByIdAndUpdate(
    userId,
    {
      $push: { movies: req.body.movieid },
    },
    { new: true }
  );

  res.json(newList);
};

const forgotPassword = async (req, res) => {
  try {
    const { mail } = req.body;

    const isMailExist = await userModel.findOne({ email: mail });

    if (isMailExist == null) {
      res.status(400).json({ message: `No user found with email: ${mail} 👎🏻` });
      return;
    }
    const verificationCode = generateVerificationCode();
    PasscodeVerificationData.userId = isMailExist._id;
    PasscodeVerificationData.code = verificationCode;
    const email = mail;
    const respo = await sendPasswordResetEmailNodeMail(email, verificationCode);
    res.json(respo);
  } catch (error) {
    res.json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { passwordReset } = req.body;
  console.log("🚀 ~ file: userController.js:114 ~ resetPassword ~ passwordReset:", passwordReset)
  if (passwordReset.resetCode == PasscodeVerificationData.code) {
    const hash = await generatePasswordHash(passwordReset.newPassword);
    const update = await userModel.findByIdAndUpdate(
      PasscodeVerificationData.userId,
      { password: hash },
      { new: true }
    );
    PasscodeVerificationData = {};
    res.json(update);
  } else {
    res.status(401).json({ message: "You entered the wrong reset code!.😣" });
  }
};

module.exports = {
  signIn,
  signup,
  watchlater,
  addtoWathclater,
  forgotPassword,
  resetPassword,
};
