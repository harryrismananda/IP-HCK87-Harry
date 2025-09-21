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
