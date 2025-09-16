exports.guardAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      throw { name: "Forbidden", message: "You are not authorized to access this resource" };
    }
    next();
  } catch (err) {
    next(err);
  }
};
exports.premiumAccess = (req, res, next) => {
  try {
    if (req.user.isPremium !== true) {
      throw { name: "Forbidden", message: "You are not authorized to access this resource" };
    }
    next();
  } catch (err) {
    next(err);
  }
};