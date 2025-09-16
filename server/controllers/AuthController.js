class AuthController {

 static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw { name: 'Unauthorized', message: 'Invalid email or password' };
      }
      const isValid = comparePassword(password, user.password);
      if (!isValid) {
        throw { name: 'Unauthorized', message: 'Invalid email or password' };
      }
      const access_token = generateToken({ id: user.id, email: user.email });
      req.access_token = access_token;
      res.status(200).json({ access_token: req.access_token });
    } catch (err) {
      next(err);
    }
  }
 static async register(req, res, next) {
    try {
      const { email, password } = req.body;
      res.status(201).json({ id: req.newUser.id, email: req.newUser.email });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;