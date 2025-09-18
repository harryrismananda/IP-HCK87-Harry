const request = require('supertest');
const app = require('../app');
const { User, Profile, UserProgress, Language } = require('../models');
const { generateToken } = require('../helpers/jwt');



describe('UserController', () => {
  let authToken;
  let testUser;
  let testLanguage;
  let testProfile;

  beforeAll(async () => {
    // Create test user for authentication
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      role: 'admin',
      isPremium: false
    });
    authToken = generateToken({ id: testUser.id });

    // Create test language
    testLanguage = await Language.create({
      name: 'Test Language'
    });
  });

  beforeEach(async () => {
    // Clean up related data before each test
    await UserProgress.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
    await Profile.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  });

  afterAll(async () => {
    // Clean up all test data
    await UserProgress.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
    await Profile.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
    await Language.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
    await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  });

  describe('GET /user/:id/profile', () => {
    it('should get user profile successfully when profile exists', async () => {
      // Create existing profile
      const existingProfile = await Profile.create({
        UserId: testUser.id,
        displayName: 'Custom Display Name',
        profilePicture: 'https://example.com/picture.jpg'
      });

      const response = await request(app)
        .get(`/user/${testUser.id}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', existingProfile.id);
      expect(response.body).toHaveProperty('UserId', testUser.id);
      expect(response.body).toHaveProperty('displayName', 'Custom Display Name');
      expect(response.body).toHaveProperty('profilePicture', 'https://example.com/picture.jpg');
      expect(response.body).toHaveProperty('isPremium', testUser.isPremium);
      expect(response.body).toHaveProperty('fullName', testUser.fullName);
      expect(response.body).toHaveProperty('email', testUser.email);
    });

    it('should create default profile when none exists', async () => {
      const response = await request(app)
        .get(`/user/${testUser.id}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('UserId', testUser.id);
      expect(response.body).toHaveProperty('displayName', testUser.fullName);
      expect(response.body).toHaveProperty('profilePicture', '');
      expect(response.body).toHaveProperty('isPremium', testUser.isPremium);
      expect(response.body).toHaveProperty('fullName', testUser.fullName);
      expect(response.body).toHaveProperty('email', testUser.email);

      // Verify profile was created in database
      const createdProfile = await Profile.findOne({ where: { UserId: testUser.id } });
      expect(createdProfile).toBeTruthy();
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 99999;

      const response = await request(app)
        .get(`/user/${nonExistentId}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .get(`/user/${testUser.id}/profile`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const originalFindByPk = User.findByPk;
      User.findByPk = jest.fn().mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get(`/user/${testUser.id}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('message');

      // Restore original method
      User.findByPk = originalFindByPk;
    });
  });

  describe('PUT /user/:id/profile', () => {
    it('should update existing profile successfully', async () => {
      // Create existing profile
      const existingProfile = await Profile.create({
        UserId: testUser.id,
        displayName: 'Old Name',
        profilePicture: 'old-picture.jpg'
      });

      const updateData = {
        displayName: 'New Display Name',
        profilePicture: 'new-picture.jpg'
      };

      const response = await request(app)
        .put(`/user/${testUser.id}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data).toHaveProperty('displayName', 'New Display Name');
      expect(response.body.data).toHaveProperty('profilePicture', 'new-picture.jpg');
      expect(response.body.data).toHaveProperty('isPremium', testUser.isPremium);
      expect(response.body.data).toHaveProperty('fullName', testUser.fullName);
      expect(response.body.data).toHaveProperty('email', testUser.email);

      // Verify update in database
      const updatedProfile = await Profile.findByPk(existingProfile.id);
      expect(updatedProfile.displayName).toBe('New Display Name');
      expect(updatedProfile.profilePicture).toBe('new-picture.jpg');
    });

    it('should create new profile when none exists', async () => {
      const profileData = {
        displayName: 'Brand New Name',
        profilePicture: 'brand-new-picture.jpg'
      };

      const response = await request(app)
        .put(`/user/${testUser.id}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data).toHaveProperty('displayName', 'Brand New Name');
      expect(response.body.data).toHaveProperty('profilePicture', 'brand-new-picture.jpg');

      // Verify creation in database
      const createdProfile = await Profile.findOne({ where: { UserId: testUser.id } });
      expect(createdProfile).toBeTruthy();
      expect(createdProfile.displayName).toBe('Brand New Name');
    });

    it('should use fallback displayName when not provided', async () => {
      const profileData = {
        profilePicture: 'picture-only.jpg'
      };

      const response = await request(app)
        .put(`/user/${testUser.id}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(200);

      expect(response.body.data).toHaveProperty('displayName', testUser.fullName);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 99999;
      const profileData = {
        displayName: 'Test Name'
      };

      const response = await request(app)
        .put(`/user/${nonExistentId}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should return 401 for missing authentication', async () => {
      const profileData = {
        displayName: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/user/${testUser.id}/profile`)
        .send(profileData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PATCH /user/:id/profile', () => {
    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app)
        .patch(`/user/${testUser.id}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 99999;

      const response = await request(app)
        .patch(`/user/${nonExistentId}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('imgUrl', Buffer.from('fake image data'), 'test.jpg')
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .patch(`/user/${testUser.id}/profile`)
        .attach('imgUrl', Buffer.from('fake image data'), 'test.jpg')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid file upload gracefully', async () => {
      const response = await request(app)
        .patch(`/user/${testUser.id}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('imgUrl', Buffer.from(''), 'empty.jpg')
        .expect([400, 500]);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /user/:id/progress', () => {
    it('should create user progress successfully', async () => {
      const progressData = {
        languageId: testLanguage.id,
        progress: {
          completed: false,
          percentage: 25,
          lessons: ['lesson1', 'lesson2']
        }
      };

      const response = await request(app)
        .post(`/user/${testUser.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(progressData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', testUser.id);
      expect(response.body).toHaveProperty('languageId', testLanguage.id);
      expect(response.body).toHaveProperty('progress');
      expect(response.body.progress.percentage).toBe(25);

      // Verify creation in database
      const createdProgress = await UserProgress.findByPk(response.body.id);
      expect(createdProgress).toBeTruthy();
    });

    it('should create progress with default values when not provided', async () => {
      const progressData = {
        languageId: testLanguage.id
      };

      const response = await request(app)
        .post(`/user/${testUser.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(progressData)
        .expect(201);

      expect(response.body.progress).toEqual({
        completed: false,
        percentage: 0,
        lessons: []
      });
    });

    it('should return 409 for duplicate language enrollment', async () => {
      // Create existing progress
      await UserProgress.create({
        userId: testUser.id,
        languageId: testLanguage.id,
        progress: { completed: false, percentage: 0, lessons: [] }
      });

      const progressData = {
        languageId: testLanguage.id,
        progress: { completed: false, percentage: 10, lessons: [] }
      };

      const response = await request(app)
        .post(`/user/${testUser.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(progressData)
        .expect(409);

      expect(response.body.message).toBe('You are already registered for this language!');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 99999;
      const progressData = {
        languageId: testLanguage.id
      };

      const response = await request(app)
        .post(`/user/${nonExistentId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(progressData)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should return 401 for missing authentication', async () => {
      const progressData = {
        languageId: testLanguage.id
      };

      const response = await request(app)
        .post(`/user/${testUser.id}/progress`)
        .send(progressData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /user/:id/progress', () => {
    it('should get all user progress successfully', async () => {
      // Create multiple progress records
      const anotherLanguage = await Language.create({ name: 'Another Language' });
      
      await UserProgress.create({
        userId: testUser.id,
        languageId: testLanguage.id,
        progress: { completed: false, percentage: 30, lessons: [] }
      });

      await UserProgress.create({
        userId: testUser.id,
        languageId: anotherLanguage.id,
        progress: { completed: true, percentage: 100, lessons: [] }
      });

      const response = await request(app)
        .get(`/user/${testUser.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      response.body.forEach(progress => {
        expect(progress).toHaveProperty('id');
        expect(progress).toHaveProperty('userId', testUser.id);
        expect(progress).toHaveProperty('languageId');
        expect(progress).toHaveProperty('progress');
        expect(progress).toHaveProperty('Language');
        expect(progress.Language).toHaveProperty('name');
      });
    });

    it('should return empty array when no progress exists', async () => {
      const response = await request(app)
        .get(`/user/${testUser.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 99999;

      const response = await request(app)
        .get(`/user/${nonExistentId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .get(`/user/${testUser.id}/progress`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  // UNUSED ENDPOINTS - These endpoints exist but are not used by the client
  describe('GET /users - UNUSED ENDPOINT', () => {
    it('should get all users successfully', async () => {
      // Create additional users
      await User.create({
        email: 'user2@example.com',
        password: 'password123',
        fullName: 'User Two',
        role: 'User'
      });

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      response.body.forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('fullName');
        expect(user).toHaveProperty('role');
      });
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .get('/users')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /user/:id/progress/:languageId - UNUSED ENDPOINT', () => {
    it('should get user progress for specific language', async () => {
      // Create progress for specific language
      await UserProgress.create({
        userId: testUser.id,
        languageId: testLanguage.id,
        progress: { completed: false, percentage: 75, lessons: [] }
      });

      const response = await request(app)
        .get(`/user/${testUser.id}/progress/${testLanguage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('userId', testUser.id);
      expect(response.body[0]).toHaveProperty('languageId', testLanguage.id);
      expect(response.body[0].progress.percentage).toBe(75);
    });

    it('should return empty array for language with no progress', async () => {
      const anotherLanguage = await Language.create({ name: 'No Progress Language' });

      const response = await request(app)
        .get(`/user/${testUser.id}/progress/${anotherLanguage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 99999;

      const response = await request(app)
        .get(`/user/${nonExistentId}/progress/${testLanguage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /user/:id/progress/:languageId - UNUSED ENDPOINT', () => {
    it('should update user progress for specific language', async () => {
      // Create existing progress
      const existingProgress = await UserProgress.create({
        userId: testUser.id,
        languageId: testLanguage.id,
        progress: { completed: false, percentage: 50, lessons: [] }
      });

      const updateData = {
        progress: { completed: true, percentage: 100, lessons: ['lesson1', 'lesson2', 'lesson3'] }
      };

      const response = await request(app)
        .put(`/user/${testUser.id}/progress/${testLanguage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', existingProgress.id);
      expect(response.body.progress.completed).toBe(true);
      expect(response.body.progress.percentage).toBe(100);
    });

    it('should return 404 for non-existent progress', async () => {
      const anotherLanguage = await Language.create({ name: 'No Progress Language' });
      const updateData = {
        progress: { completed: true, percentage: 100, lessons: [] }
      };

      const response = await request(app)
        .put(`/user/${testUser.id}/progress/${anotherLanguage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Progress not found');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 99999;
      const updateData = {
        progress: { completed: true, percentage: 100, lessons: [] }
      };

      const response = await request(app)
        .put(`/user/${nonExistentId}/progress/${testLanguage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('DELETE /user/:id - UNUSED ENDPOINT', () => {
    it('should delete user successfully', async () => {
      // Create user to delete
      const userToDelete = await User.create({
        email: 'delete@example.com',
        password: 'password123',
        fullName: 'Delete User',
        role: 'User'
      });

      const response = await request(app)
        .delete(`/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify user was deleted
      const deletedUser = await User.findByPk(userToDelete.id);
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 99999;

      const response = await request(app)
        .delete(`/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .delete(`/user/${testUser.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Authentication and Authorization Tests', () => {
   

    it('should handle missing Authorization header gracefully', async () => {
      const response = await request(app)
        .get(`/user/${testUser.id}/profile`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle empty Authorization header gracefully', async () => {
      const response = await request(app)
        .get(`/user/${testUser.id}/profile`)
        .set('Authorization', '')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should validate token format (Bearer prefix)', async () => {
      const response = await request(app)
        .get(`/user/${testUser.id}/profile`)
        .set('Authorization', authToken) // Missing 'Bearer ' prefix
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle admin role authentication for unused endpoints', async () => {
      // Create admin user
      const adminUser = await User.create({
        email: 'admin@example.com',
        password: 'password123',
        fullName: 'Admin User',
        role: 'admin'
      });
      const adminToken = generateToken({ id: adminUser.id });

      // Test admin access to get all users (unused endpoint)
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

   
  });

  describe('Edge Cases and Data Validation', () => {


    it('should handle complex progress JSON data', async () => {
      const complexProgress = {
        languageId: testLanguage.id,
        progress: {
          completed: false,
          percentage: 45,
          lessons: [
            { id: 1, completed: true, score: 95 },
            { id: 2, completed: false, score: null }
          ],
          achievements: ['first_lesson', 'quiz_master'],
          lastAccessed: new Date().toISOString(),
          streakDays: 7
        }
      };

      const response = await request(app)
        .post(`/user/${testUser.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(complexProgress)
        .expect(201);

      expect(response.body.progress).toEqual(complexProgress.progress);
    });

    



  
  });

  describe('Transaction and Data Consistency', () => {
    it('should maintain data consistency during profile updates', async () => {
      // Test that profile creation and updates maintain consistency
      const profileData = {
        displayName: 'Consistency Test User',
        profilePicture: 'https://example.com/test.jpg'
      };

      const response = await request(app)
        .put(`/user/${testUser.id}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(200);

      // Verify both response and database are consistent
      expect(response.body.data.displayName).toBe('Consistency Test User');
      
      const profile = await Profile.findOne({ where: { UserId: testUser.id } });
      expect(profile.displayName).toBe('Consistency Test User');
      expect(profile.profilePicture).toBe('https://example.com/test.jpg');
    });

    
  });
});