const AuthController = require('../controllers/AuthController')
const CourseController = require('../controllers/CourseController')
const LanguageController = require('../controllers/LanguageController')
const QuestionController = require('../controllers/QuestionController')
const TransactionController = require('../controllers/TransactionController')
const UserController = require('../controllers/UserController')
const { authenticate } = require('../middlewares/authentication')
const { guardAdmin, premiumAccess } = require('../middlewares/authorization')
const router = require('express').Router()
const multer = require(`multer`)
const upload = multer({storage: multer.memoryStorage()})

router.post('/login', AuthController.login) 
router.post('/google-login', AuthController.googleLogin)
router.post('/register', AuthController.register)

// Transaction webhook endpoint - needs to be before authentication
router.post(`/transactions/transaction-status`, TransactionController.transactionNotification)

//language routes
router.get(`/languages`, LanguageController.getAllLanguages)
router.get(`/languages/:id`, LanguageController.getLanguageById)

//routes below needs authentication
router.use(authenticate)

//user routes
router.get(`/user/:id/profile`, UserController.getUserProfile)
router.put(`/user/:id/profile`, UserController.updateUserProfile) //upsert
router.patch(`/user/:id/profile`, upload.single(`imgUrl`), UserController.patchProfilePicture) //upsert

//userprogress route
router.post(`/user/:id/progress`, UserController.createUserProgress)
router.get(`/user/:id/progress`, UserController.getAllUserProgress)
router.get(`/user/:id/progress/:languageId`, UserController.getUserProgress)
router.put(`/user/:id/progress/:languageId`, UserController.updateUserProgress)



//courses routes
router.get(`/courses`, premiumAccess, CourseController.getAllCourses) //premium only
router.get(`/courses/language/:languageId`, CourseController.getCourseByLanguageId) //some are preemium
router.get(`/courses/:id`, CourseController.getCourseById) //some are preemium
router.post(`/courses`, CourseController.createCourse)

//questions routes
router.get(`/questions`, QuestionController.getAllQuestions) //for a particular course, not every question
router.get(`/questions/:id`, QuestionController.getQuestionById)
router.post(`/questions`,  QuestionController.createQuestion)

//transaction routes
router.post(`/transactions/create-order`, TransactionController.createOrder)
router.post(`/transactions/create-transaction`, TransactionController.createTransaction)

//CMS route(need authorization as admin)
router.use(guardAdmin)
router.get(`/users`, UserController.getAllUsers)
router.delete(`/users/:id`, UserController.deleteUser)
router.post(`/languages`, LanguageController.createLanguage)
router.delete(`/languages/:id`, LanguageController.deleteLanguage)
router.put(`/courses/:id`, CourseController.updateCourse)
router.delete(`/courses/:id`, CourseController.deleteCourse)
router.put(`/questions/:id`,  QuestionController.updateQuestion)
router.delete(`/questions/:id`,  QuestionController.deleteQuestion)

module.exports = router