const express = require('express');
const { asyncMiddlewareWrapper } = require('@root/helpers');
const {
  validateBody,
  validateJwtToken,
  uploadFile,
} = require('@root/middlewares');
const {
  usersValidationSchemas: {
    userJoiSchema,
    subscriptionJoiSchema,
    verifyJoiSchema,
  },
} = require('@root/models');
// const validateID = require('@root/middlewares/validateID');
const { authActions, updateUserAvatar } = require('@root/controllers');

const router = express.Router();

router.post(
  '/signup',
  validateBody(userJoiSchema, 'Ошибка от Joi или другой библиотеки валидации'),
  asyncMiddlewareWrapper(authActions.signup)
);
router.post(
  '/login',
  validateBody(userJoiSchema, 'Ошибка от Joi или другой библиотеки валидации'),
  asyncMiddlewareWrapper(authActions.login)
);
router.post(
  '/verify',
  validateBody(verifyJoiSchema, 'missing required field email'),
  asyncMiddlewareWrapper(authActions.resendVerificationToken)
);
router.get(
  '/logout',
  validateJwtToken,
  asyncMiddlewareWrapper(authActions.logout)
);
router.get(
  '/current',
  validateJwtToken,
  asyncMiddlewareWrapper(authActions.getCurrentUserInfo)
);
router.get(
  '/verify/:verificationToken',
  asyncMiddlewareWrapper(authActions.verify)
);
router.patch(
  '/',
  validateJwtToken,
  validateBody(
    subscriptionJoiSchema,
    'Ошибка от Joi или другой библиотеки валидации'
  ),
  asyncMiddlewareWrapper(authActions.changeSubscription)
);
router.patch(
  '/avatars',
  validateJwtToken,
  uploadFile.single('avatar'),
  asyncMiddlewareWrapper(updateUserAvatar)
);

module.exports = router;
