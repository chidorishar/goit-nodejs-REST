const express = require('express');
const { asyncMiddlewareWrapper } = require('@root/helpers');
const { validateBody, validateJwtToken } = require('@root/middlewares');
const { userJoiSchema, subscriptionJoiSchema } = require('@root/models');
// const validateID = require('@root/middlewares/validateID');
const { authActions } = require('@root/controllers');

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
router.patch(
  '/',
  validateJwtToken,
  validateBody(
    subscriptionJoiSchema,
    'Ошибка от Joi или другой библиотеки валидации'
  ),
  asyncMiddlewareWrapper(authActions.changeSubscription)
);

module.exports = router;
