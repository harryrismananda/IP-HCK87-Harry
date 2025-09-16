const { User, Profile, UserProgress } = require("../models");

class UserController {
  static async getAllUsers(req, res, next) {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  }
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  static async createUserProfile(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      const profileData = req.body;
      const newProfile = await Profile.create({ ...profileData, UserId: user.id });
      res.status(201).json(newProfile);
    } catch (err) {
      next(err);
    }
  }

  static async getUserProfile(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      const profile = await user.getProfile();
      if (!profile) {
        throw { name: "NotFound", message: "Profile not found" };
      }
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  }

  static async updateUserProfile (req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      const profile = await user.getProfile();
      if (!profile) {
        throw { name: "NotFound", message: "Profile not found" };
      }
      const profileData = req.body;
      await profile.update(profileData);
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  }

  static async createUserProgress(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      const progressData = req.body;
      const newProgress = await UserProgress.create({ ...progressData, UserId: user.id });
      res.status(201).json(newProgress);
    } catch (err) {
      next(err);
    }   
  }

  static async getUserProgress(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      const progress = await UserProgress.findAll({ where: { UserId: user.id } });
      res.status(200).json(progress);
    } catch (err) {
      next(err);
    } 
  }

  static async updateUserProgress(req, res, next) {
    try {
      const { id, progressId } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      const progress = await UserProgress.findByPk(progressId);
      if (!progress) {
        throw { name: "NotFound", message: "Progress not found" };
      }
      const progressData = req.body;
      await progress.update(progressData);
      res.status(200).json(progress);
    } catch (err) {
      next(err);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      await user.destroy();
      res.status(204).json();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
