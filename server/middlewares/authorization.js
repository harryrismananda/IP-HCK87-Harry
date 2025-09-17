exports.guardAdmin = (req, res, next) => {
  try {
    console.log(req.user_data);
    if (req.user_data.role !== "admin") {
      throw { name: "Forbidden", message: "You are not authorized to access this resource" };
    }
    next();
  } catch (err) {
    next(err);
  }
};
exports.premiumAccess = (req, res, next) => {
  try {
    if (req.user_data.status === true || req.user_data.role === "admin") {
      next();
    } else {
      throw { name: "Forbidden", message: "You are not authorized to access this resource" };
    }
  } catch (err) {
    next(err);
  }
};