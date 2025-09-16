
const errorHandler = (err, req, res, next) => {
  console.log(err);
  switch (err.name) {

    case "SequelizeUniqueConstraintError":
    case "SequelizeValidationError":
      res.status(400).json({ error: err.errors.message[0] });
      break;

    default:
      res.status(500).json({ error: "Internal server error!" });
      break;
  }
};

module.exports = errorHandler;
