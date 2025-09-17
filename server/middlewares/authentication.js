const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");
exports.authenticate = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw { name: "Unauthorized", message: "No authorization header" };
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw { name: "Unauthorized", message: "No token provided" };
    }
    // Verify token (pseudo-code)
    const data = verifyToken(token);
    if (!data) {
      throw { 
        name: "Unauthorized", message: "Invalid token" };
    }
    const user = await User.findByPk(data.id); 
    if (!user) {
      throw { name: "Unauthorized", message: "Invalid token" };
    }
    req.user_data = user;
    next();
  } catch (err) {
    next(err);
  }
};
