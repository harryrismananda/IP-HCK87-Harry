exports.authenticate = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw { name: "Unauthorized", message: "No authorization header" };
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw { name: "Unauthorized", message: "No token provided" };
    }
    // Verify token (pseudo-code)
    const user = verifyToken(token);
    if (!user) {
      throw { name: "Unauthorized", message: "Invalid token" };
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
