const jwt = require('jsonwebtoken');
const {
  AuthCredentialsError,
  MongoDBActionError,
  UserConflictError,
  AuthVerificationError,
} = require('../helpers');
const { UserModel } = require('../models');
const fs = require('fs/promises');
const path = require('path');
const Jimp = require('jimp');
const { sendEmail } = require('../services');

const { SECRET_KEY, BASE_URL, PORT } = process.env;
const pathToAvatars = path.resolve(__dirname, '..', 'public', 'avatars');

async function signup(req, res, next) {
  const { email, password } = req.body;

  // is user exist in DB
  const hasUserWithEmail = !!(await UserModel.findOne({ email }));
  if (hasUserWithEmail) throw new UserConflictError();

  // create and save new user
  const newUser = new UserModel({ email });
  newUser.addPassword(password);
  newUser.addVerificationToken();
  newUser.setAvatar();
  const savedUser = await newUser.save();
  if (!savedUser) throw new MongoDBActionError('Failed to save new user');

  // send verification code to user's email
  const verificationLink = `${BASE_URL + ':' + PORT}/api/users/verify/${
    savedUser.verificationToken
  }`;
  const message = {
    recieverEmail: email,
    topic: 'Verification code',
    messageText: `Please complete your verification by following this link: ${verificationLink}`,
    messageMarkup: `Please complete your verification by following this link: <a href=${verificationLink}>${verificationLink}</a>`,
  };
  await sendEmail(message);

  // report
  const { subscription, token } = savedUser;
  res.status(201).json({ user: { email, subscription, token } });
}

async function login(req, res, next) {
  const { email, password } = req.body;

  // is user exist in DB and are the passwords equal
  const userWithEmail = await UserModel.findOne({ email, verified: true });
  if (!userWithEmail || !userWithEmail.comparePasswords(password))
    throw new AuthCredentialsError(401);

  // add token and update in DB
  const { _id, subscription } = userWithEmail;
  const token = jwt.sign({ _id }, SECRET_KEY, { expiresIn: '2h' });
  userWithEmail.token = token;
  const updatedUser = await userWithEmail.save();
  if (!updatedUser)
    throw new MongoDBActionError('Failed to update user`s info');

  // report
  res.status(200).json({ token, user: { email, subscription } });
}

async function logout(req, res, next) {
  const { userDoc } = req.user;

  // annulate user`s token
  userDoc.token = null;
  const updatedUser = await userDoc.save();
  if (!updatedUser)
    throw new MongoDBActionError('Failed to update user`s info');

  // report
  res.status(204).send();
}

async function getCurrentUserInfo(req, res, next) {
  const { userDoc } = req.user;
  const { email, subscription, avatarURL } = userDoc;

  // send back user info
  res.status(200).json({ email, subscription, avatarURL });
}

async function changeSubscription(req, res, next) {
  const { userDoc } = req.user;

  // update info about user
  userDoc.subscription = req.body.subscription;
  const updatedUser = await userDoc.save();
  if (!updatedUser)
    throw new MongoDBActionError('Failed to update user`s info');

  // send back user info
  const { email, subscription } = updatedUser;
  res.status(200).json({ email, subscription });
}

async function updateAvatar(req, res, next) {
  const { userDoc } = req.user;
  const { filename: avatarFilename, path: pathToTmpAvatar } = req.file;
  const publicPathToAvatar = path.join(pathToAvatars, avatarFilename);

  // resize and move image to avatars folder
  (await Jimp.read(pathToTmpAvatar)).cover(250, 250).write(publicPathToAvatar);
  await fs.unlink(pathToTmpAvatar);

  // update user's avatar
  userDoc.setAvatar(publicPathToAvatar);
  const updatedUser = await userDoc.save();
  if (!updatedUser)
    throw new MongoDBActionError('Failed to update user`s avatar');

  // send back user info
  res.status(200).json({ avatarURL: '/avatars/' + avatarFilename });
}

async function verify(req, res, next) {
  const { verificationToken } = req.params;
  console.log(verificationToken);

  // is user exist in DB
  const userWithVerToken = await UserModel.findOne({
    verificationToken,
    verified: false,
  });
  if (!userWithVerToken) throw new AuthVerificationError();

  // erase verification token and set verified flag
  userWithVerToken.verificationToken = '-';
  userWithVerToken.verified = true;
  const updatedUser = await userWithVerToken.save();
  if (!updatedUser)
    throw new MongoDBActionError('Failed to update user`s info');

  // report
  res.status(200).json({ message: 'Verification succeed' });
}

module.exports = {
  signup,
  login,
  logout,
  getCurrentUserInfo,
  changeSubscription,
  updateAvatar,
  verify,
};
