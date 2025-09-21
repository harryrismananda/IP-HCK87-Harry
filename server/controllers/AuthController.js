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
      const receivedEmail = email.toLowerCase();
      const user = await User.findOne({ where: { email: receivedEmail } });
      if (!user) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }
      const isValid = comparePassword(password, user.password);
      if (!isValid) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }
     
      const access_token = generateToken({ id: user.id, email: user.email });
      req.access_token = access_token;
      const user_data = { id: user.id, email: user.email, fullName: user.fullName, role:user.role, isPremium:user.isPremium };
      req.user_data = user_data;
      res.status(200).json({ access_token: req.access_token, user_data:req.user_data });
    } catch (err) {
      next(err);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const { googleToken } = req.body;
       if (!googleToken) {
        throw { name: "Bad Request", message: "Invalid Google token" };
      }
       if (googleToken === `invalid-token`) {
        throw { name: "Unauthorized", message: "Invalid Google token" };
      }
      // console.log(req.body);
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
     
     
      const payload = ticket.getPayload();
      const [user, created] = await User.findOrCreate({
        where: { email: payload.email },
        defaults: {
          email: payload.email,
          fullName: payload.name,
          password: Math.random().toString(36).slice(-8),
        },
      });
      const access_token = generateToken({ id: user.id, email: user.email });
      req.access_token = access_token;
      const user_data = { id: user.id, email: user.email, fullName: user.fullName, role:user.role, status:user.isPremium };
      req.user_data = user_data;
      res.status(created ? 201 : 200).json({ access_token: req.access_token, user_data: req.user_data });
    } catch (err) {
      next(err);
    }
  }

  static async register(req, res, next) {
    try {
      const { email, password, fullName } = req.body;
      const newUser = await User.create({ email, password, fullName });
      res.status(201).json({ id: newUser.id, email: newUser.email, fullName: newUser.fullName  });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
