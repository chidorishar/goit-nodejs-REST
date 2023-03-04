class HttpError {
  static statusMessages = {
    400: 'Bad Request',
    401: 'Not authorized',
    403: 'Forbidden',
    404: 'Not found',
    409: 'Conflict',
  };

  constructor(status, message = HttpError.statusMessages[status]) {
    const error = new Error(message);
    error.status = status;

    return error;
  }
}

class UserConflictError extends HttpError {
  constructor() {
    return super(409, 'Email in use');
  }
}

class MongoDBActionError extends HttpError {
  constructor(message = 'Unknown error on action with DB') {
    return super(500, message);
  }
}

class AuthCredentialsError extends HttpError {
  constructor(message = "User didn't pass verification requirements") {
    return super(401, "Email or password is wrong, or email doesn't verified.");
  }
}

class AuthVerificationError extends HttpError {
  constructor(message = 'Unverified user with provided token not found') {
    return super(404, message);
  }
}

module.exports = {
  AuthCredentialsError,
  HttpError,
  MongoDBActionError,
  UserConflictError,
  AuthVerificationError,
};
