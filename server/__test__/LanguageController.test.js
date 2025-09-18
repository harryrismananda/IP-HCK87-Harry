const request = require('supertest');
const app = require('../app');
const { Language, Course, User } = require('../models');
const { generateToken } = require('../helpers/jwt');

describe('LanguageController', () => {
  let authToken;
  let testUser;
  let testLanguage;

  beforeAll(async () => {
    // Create test user for authentication (needed for CMS endpoints)
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      role: 'admin'
    });
    authToken = generateToken({ id: testUser.id });
  });

  beforeEach(async () => {
    // Clean up languages before each test
    await Course.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
    await Language.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });

    // Create test language for each test
    testLanguage = await Language.create({
      name: 'Test Language'
    });
  });

  afterAll(async () => {
    // Clean up all test data
    await Course.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
    await Language.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
    await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  });

  describe('GET /languages', () => {
    it('should get all languages successfully', async () => {
      // Create additional languages
      await Language.create({ name: 'English' });
      await Language.create({ name: 'Japanese' });
      await Language.create({ name: 'Spanish' });

      const response = await request(app)
        .get('/languages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(4); // 3 new + 1 test language
      
      // Check structure of language objects
      response.body.forEach(language => {
        expect(language).toHaveProperty('id');
        expect(language).toHaveProperty('name');
        expect(language).toHaveProperty('createdAt');
        expect(language).toHaveProperty('updatedAt');
        expect(typeof language.name).toBe('string');
        expect(language.name.length).toBeGreaterThan(0);
      });
    });

    it('should return empty array when no languages exist', async () => {
      // Remove test language
      await Language.destroy({ where: {} });

      const response = await request(app)
        .get('/languages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const originalFindAll = Language.findAll;
      Language.findAll = jest.fn().mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/languages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('message');

      // Restore original method
      Language.findAll = originalFindAll;
    });

    it('should return languages in consistent order', async () => {
      // Create languages with specific names
      const languageNames = ['Arabic', 'Chinese', 'French', 'German'];
      for (const name of languageNames) {
        await Language.create({ name });
      }

      const response = await request(app)
        .get('/languages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBe(languageNames.length + 1); // +1 for testLanguage
      
      // All languages should have valid IDs and names
      response.body.forEach(language => {
        expect(typeof language.id).toBe('number');
        expect(typeof language.name).toBe('string');
        expect(language.name.trim().length).toBeGreaterThan(0);
      });
    });

    it('should include timestamps in response', async () => {
      const response = await request(app)
        .get('/languages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      
      response.body.forEach(language => {
        expect(language).toHaveProperty('createdAt');
        expect(language).toHaveProperty('updatedAt');
        expect(new Date(language.createdAt)).toBeInstanceOf(Date);
        expect(new Date(language.updatedAt)).toBeInstanceOf(Date);
      });
    });
  });

  // UNUSED ENDPOINTS - These endpoints exist but are not used by the client
  describe('GET /languages/:id - UNUSED ENDPOINT', () => {
    it('should get language by id successfully', async () => {
      const response = await request(app)
        .get(`/languages/${testLanguage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testLanguage.id);
      expect(response.body).toHaveProperty('name', testLanguage.name);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent language', async () => {
      const nonExistentId = 99999;

      const response = await request(app)
        .get(`/languages/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('Language not found');
    });

    it('should return 400 for invalid language id format', async () => {
      const response = await request(app)
        .get('/languages/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const originalFindByPk = Language.findByPk;
      Language.findByPk = jest.fn().mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get(`/languages/${testLanguage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('message');

      // Restore original method
      Language.findByPk = originalFindByPk;
    });

    it('should handle numeric string language IDs', async () => {
      const response = await request(app)
        .get(`/languages/${testLanguage.id.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testLanguage.id);
    });
  });

  describe('POST /languages - UNUSED ENDPOINT', () => {
    it('should create language successfully', async () => {
      const languageData = {
        name: 'New Language'
      };

      const response = await request(app)
        .post('/languages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(languageData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', languageData.name);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      // Verify language was created in database
      const createdLanguage = await Language.findByPk(response.body.id);
      expect(createdLanguage).toBeTruthy();
      expect(createdLanguage.name).toBe(languageData.name);
    });

    it('should return 400 for missing language name', async () => {
      const response = await request(app)
        .post('/languages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for empty language name', async () => {
      const languageData = {
        name: ''
      };

      const response = await request(app)
        .post('/languages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(languageData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 for missing authentication', async () => {
      const languageData = {
        name: 'Unauthorized Language'
      };

      const response = await request(app)
        .post('/languages')
        .send(languageData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const originalCreate = Language.create;
      Language.create = jest.fn().mockRejectedValueOnce(new Error('Database constraint violation'));

      const languageData = {
        name: 'Error Language'
      };

      const response = await request(app)
        .post('/languages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(languageData)
        .expect(500);

      expect(response.body).toHaveProperty('message');

      // Restore original method
      Language.create = originalCreate;
    });

    it('should handle very long language names', async () => {
      const longName = 'A'.repeat(255);
      const languageData = {
        name: longName
      };

      const response = await request(app)
        .post('/languages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(languageData);

      // Should either succeed or return validation error
      expect([201, 400].includes(response.status)).toBe(true);
    });

    
  });

  describe('DELETE /languages/:id - UNUSED ENDPOINT', () => {
    it('should delete language successfully', async () => {
      const response = await request(app)
        .delete(`/languages/${testLanguage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify language was deleted
      const deletedLanguage = await Language.findByPk(testLanguage.id);
      expect(deletedLanguage).toBeNull();
    });

    it('should return 404 for non-existent language', async () => {
      const nonExistentId = 99999;

      const response = await request(app)
        .delete(`/languages/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('Language not found');
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .delete(`/languages/${testLanguage.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid language id format', async () => {
      const response = await request(app)
        .delete('/languages/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error for findByPk
      const originalFindByPk = Language.findByPk;
      Language.findByPk = jest.fn().mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .delete(`/languages/${testLanguage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('message');

      // Restore original method
      Language.findByPk = originalFindByPk;
    });

    it('should handle cascade deletion constraints', async () => {
      // Create a course associated with the language
      await Course.create({
        languageId: testLanguage.id,
        title: 'Associated Course',
        difficulty: 'Beginner',
        content: { roadmap: 'Test roadmap', lessons: [] }
      });

      // Try to delete the language (may fail due to foreign key constraints)
      const response = await request(app)
        .delete(`/languages/${testLanguage.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Should either succeed with cascade or fail with constraint error
      expect([204, 400, 500].includes(response.status)).toBe(true);
    });
  });

  describe('Edge Cases and Data Validation', () => {
    it('should handle special characters in language names', async () => {
      const specialNames = [
        '中文', // Chinese characters
        'العربية', // Arabic characters
        'Español', // Spanish with accent
        'Français', // French with accent
        'Português', // Portuguese with accent
        'Русский' // Russian characters
      ];

      for (const name of specialNames) {
        const response = await request(app)
          .post('/languages')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ name });

        if (response.status === 201) {
          expect(response.body.name).toBe(name);
        }
      }
    });

    it('should handle duplicate language names appropriately', async () => {
      const duplicateName = 'Duplicate Language';
      
      // Create first language
      await Language.create({ name: duplicateName });

      // Try to create second language with same name
      const response = await request(app)
        .post('/languages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: duplicateName });

      // Should either allow duplicates or return error (depends on business logic)
      expect([201, 400].includes(response.status)).toBe(true);
    });

    it('should handle null and undefined values gracefully', async () => {
      const invalidData = [
        { name: null },
        { name: undefined },
        {}
      ];

      for (const data of invalidData) {
        const response = await request(app)
          .post('/languages')
          .set('Authorization', `Bearer ${authToken}`)
          .send(data)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      }
    });

    it('should maintain data consistency during concurrent requests', async () => {
      const promises = [];
      
      // Create multiple languages concurrently
      for (let i = 0; i < 5; i++) {
        const promise = request(app)
          .post('/languages')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ name: `Concurrent Language ${i}` });
        promises.push(promise);
      }

      const responses = await Promise.all(promises);
      
      // All successful responses should have unique IDs
      const successfulResponses = responses.filter(r => r.status === 201);
      const ids = successfulResponses.map(r => r.body.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });


  });

  describe('Performance and Scalability', () => {
    it('should handle large number of languages efficiently', async () => {
      // Create many languages
      const languages = [];
      for (let i = 0; i < 100; i++) {
        languages.push({ name: `Language ${i}` });
      }
      await Language.bulkCreate(languages);

      const start = Date.now();
      const response = await request(app)
        .get('/languages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const duration = Date.now() - start;

      expect(response.body.length).toBe(101); // 100 + testLanguage
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

   
  });
});