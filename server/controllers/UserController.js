const { User, Profile, UserProgress } = require("../models");
const { sequelize } = require("../models");
const cloudinary = require('cloudinary').v2;

class UserController {
  static async getAllUsers(req, res, next) {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
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
      
      let profile = await Profile.findOne({ 
        where: { UserId: user.id }
      });
      
      if (!profile) {
        // Create a default profile if none exists
        profile = await Profile.create({
          UserId: user.id,
          displayName: user.fullName || "",
          profilePicture: ""
        });
      }
      
      // Return profile with user data included
      const responseData = {
        ...profile.toJSON(),
        isPremium: user.isPremium,
        fullName: user.fullName,
        email: user.email
      };
      
      res.status(200).json(responseData);
    } catch (err) {
      next(err);
    }
  }

  static async updateUserProfile(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      
      // Find existing profile or create new one
      let profile = await Profile.findOne({ where: { UserId: user.id } });
      
      if (profile) {
        // Update existing profile with the request body data
        await profile.update(req.body);
        await profile.reload(); // Ensure we get fresh data
      } else {
        // Create new profile only if none exists
        profile = await Profile.create({ 
          ...req.body, 
          UserId: user.id,
          displayName: req.body.displayName || user.fullName || ""
        });
      }

      // Return consistent response with user data
      const responseData = {
        ...profile.toJSON(),
        isPremium: user.isPremium,
        fullName: user.fullName,
        email: user.email
      };

      res.status(200).json({
        message: "Profile updated successfully",
        data: responseData
      });
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
      
      const { languageId, ...otherProgressData } = req.body;
      
      // Check if user progress already exists for this language
      const existingProgress = await UserProgress.findOne({
        where: {
          userId: user.id,
          languageId: languageId
        }
      });

      if (existingProgress) {
        throw { name: "Conflict", message: "You are already registered for this language!" };
      }

      // Create new progress if none exists
      const progressData = {
        userId: user.id,
        languageId: languageId,
        progress: otherProgressData.progress || { completed: false, percentage: 0, lessons: [] },
        ...otherProgressData
      };
      
      const newProgress = await UserProgress.create(progressData);
      res.status(201).json(newProgress);
    } catch (err) {
      next(err);
    }   
  }

  static async getUserProgress(req, res, next) {
    try {
      const { languageId, id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      const progress = await UserProgress.findAll({ 
        where: { 
          userId: user.id,
          languageId: languageId
        } 
      });
      res.status(200).json(progress);
    } catch (err) {
      next(err);
    } 
  }

  static async getAllUserProgress(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      const progress = await UserProgress.findAll({ 
        where: { 
          userId: user.id
        },
        include: [{
          model: require('../models').Language,
          attributes: ['name']
        }]
      });
      res.status(200).json(progress);
    } catch (err) {
      next(err);
    } 
  }

  static async updateUserProgress(req, res, next) {
    try {
      const { id, languageId } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      const progress = await UserProgress.findOne({ 
        where: { 
          userId: user.id,
          languageId: languageId
        } 
      });
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

  static async patchProfilePicture(req, res, next) {
    try {
      if (!req.file) {
        throw {name: "No File Uploaded"} //perlu di handle error 400 file ga ada
      }

      const userId = req.params.id;

      const user = await User.findByPk(userId);
      if (!user) {
       throw { name: "NotFound", message: "User not found" }
      }
      
      const base64Image = req.file.buffer.toString(`base64`)
      const dataURI = `data:${req.file.mimetype};base64,${base64Image}`
      const result = await cloudinary.uploader.upload(dataURI, {folder: `GC01-Harry`})

      // Use transaction to ensure data consistency
      const transaction = await sequelize.transaction();
      
      try {
        // Find existing profile first
        let profile = await Profile.findOne({ 
          where: { UserId: user.id },
          transaction 
        });
        
        if (profile) {
          // Update existing profile
          await profile.update(
            { profilePicture: result.secure_url },
            { transaction }
          );
        } else {
          // Create new profile only if none exists
          profile = await Profile.create({
            UserId: user.id,
            profilePicture: result.secure_url,
            displayName: user.fullName || "" // Set default display name
          }, { transaction });
        }

        // Commit the transaction
        await transaction.commit();
      } catch (transactionError) {
        await transaction.rollback();
        throw transactionError;
      }

      res.json({
        message: `Profile picture updated successfully`,
        profilePicture: result.secure_url
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
