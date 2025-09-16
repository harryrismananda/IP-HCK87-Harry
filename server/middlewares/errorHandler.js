const errorHandler = (err, req, res, next) => {
  console.log(err);
  switch (err.name) {
    case "Forbidden":
      res.status(403).json({ message: err.message });
      return;
    case "NotFound":
      res.status(404).json({ message: err.message });
      return;
    case "EmptyEmail":
    case "EmptyPassword":
      res.status(400).json({ message: err.message });
      return;
    case "Unauthorized":
      res.status(401).json({ message: err.message });
      return;
    case "SequelizeUniqueConstraintError":
    case "SequelizeValidationError":
      res.status(400).json({ message: err.errors.message[0] });
      return;

    default:
      res.status(500).json({ message: "Internal server error!" });
      return;
  }
};

module.exports = errorHandler;
