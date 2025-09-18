const errorHandler = (err, req, res, next) => {
  console.log(err);
  switch (err.name) {
    case "Forbidden":
      res.status(403).json({ message: err.message });
      return;
    case "NotFound":
      res.status(404).json({ message: err.message });
      return;
    case "Conflict":
      res.status(409).json({ message: err.message });
      return;
    case "EmptyEmail":
    case "EmptyPassword":
    case "No File Uploaded":
      res.status(400).json({ message: err.message || "No file uploaded" });
      return;
    case "Unauthorized":
      res.status(401).json({ message: err.message });
      return;
    case "SequelizeUniqueConstraintError":
      // Handle specific unique constraint for user progress
      if (err.parent && err.parent.constraint === 'unique_user_language_progress') {
        res.status(409).json({ message: "You are already registered for this language!" });
      } else {
        res.status(400).json({ message: err.errors[0].message });
      }
      return;
    case "SequelizeValidationError":
      res.status(400).json({ message: err.errors[0].message });
      return;
    case "Bad Request":
      res.status(400).json({ message: err.message });
      return;

    default:
      res.status(500).json({ message: "Internal server error!" });
      return;
  }
};

module.exports = errorHandler;
