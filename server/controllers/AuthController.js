const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { generateToken } = require("../helpers/jwt");
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();
class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email) {
        throw { name: `EmptyEmail`, message: `Email is required` };
      }
      if (!password) {
        throw { name: `EmptyPassword`, message: `Password is required` };
      }
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }
      const isValid = comparePassword(password, user.password);
      if (!isValid) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }
      const access_token = generateToken({ id: user.id, email: user.email });
      req.access_token = access_token;
      res.status(200).json({ access_token: req.access_token });
    } catch (err) {
      next(err);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const { id_token } = req.body;
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const [user, created] = await User.findOrCreate({
        where: { email: payload.email },
        defaults: {
          name: payload.name,
          password: Math.random().toString(36).slice(-8),
        },
      });
      const access_token = generateToken({ id: user.id, email: user.email });
      req.access_token = access_token;
      res.status(created ? 201 : 200).json({ access_token: req.access_token });
    } catch (err) {
      next(err);
    }
  }

  static async register(req, res, next) {
    try {
      const { email, password } = req.body;
      const newUser = await User.create({ email, password });
      res.status(201).json({ id: newUser.id, email: newUser.email });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
