# BiblioLex API Documentation

## Overview
BiblioLex is an AI-powered language learning platform API that provides endpoints for user authentication, course management, language learning, and progress tracking.

**Base URL:** `http://localhost:3000`

**API Version:** 1.0.0

---

## Global Error Responses

All endpoints may return the following error responses:

### Authentication Errors
```json
{
  "message": "No authorization header"
}
```
**Status Code:** `401 Unauthorized`

```json
{
  "message": "No token provided"
}
```
**Status Code:** `401 Unauthorized`

```json
{
  "message": "Invalid email or password"
}
```
**Status Code:** `401 Unauthorized`

```json
{
  "message": "Invalid Google token"
}
```
**Status Code:** `401 Unauthorized`

### Authorization Errors
```json
{
  "message": "You are not authorized to access this resource"
}
```
**Status Code:** `403 Forbidden`

### Validation Errors
```json
{
  "message": "Email is required"
}
```
**Status Code:** `400 Bad Request`

```json
{
  "message": "Password is required"
}
```
**Status Code:** `400 Bad Request`

```json
{
  "message": "userId and amount are required"
}
```
**Status Code:** `400 Bad Request`

```json
{
  "message": "Parameter is required"
}
```
**Status Code:** `400 Bad Request`

```json
{
  "message": "Invalid parameter structure. transaction_details with order_id and gross_amount are required"
}
```
**Status Code:** `400 Bad Request`

### Database Errors
```json
{
  "message": "Internal server error!"
}
```
**Status Code:** `500 Internal Server Error`

### Conflict Errors
```json
{
  "message": "You are already registered for this language!"
}
```
**Status Code:** `409 Conflict`

### Not Found Errors
```json
{
  "message": "User not found"
}
```
**Status Code:** `404 Not Found`

```json
{
  "message": "Course not found"
}
```
**Status Code:** `404 Not Found`

### Transaction-Specific Error Handling
For transaction endpoints, particularly webhook notifications, the API follows Midtrans best practices by always returning HTTP 200 status codes to prevent infinite retry loops. Error conditions are handled gracefully with descriptive messages while maintaining webhook stability.
**Status Code:** `409 Conflict`

### Not Found Errors
```json
{
  "message": "User not found"
}
```
**Status Code:** `404 Not Found`

```json
{
  "message": "Course not found"
}
```
**Status Code:** `404 Not Found`

```json
{
  "message": "Language not found"
}
```
**Status Code:** `404 Not Found`

### Server Errors
```json
{
  "message": "Internal server error!"
}
```
**Status Code:** `500 Internal Server Error`

```json
{
  "message": "Invalid notification data"
}
```
**Status Code:** `500 Internal Server Error`

```json
{
  "message": "Missing order_id in notification"
}
```
**Status Code:** `500 Internal Server Error`

---

## Authentication

### POST /login
User login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "status": false
  }
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `400 Bad Request` - Missing email or password
- `401 Unauthorized` - Invalid email or password

---

### POST /google-login
User login with Google OAuth.

**Request Body:**
```json
{
  "googleToken": "google_oauth_token_here"
}
```

**Success Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_data": {
    "id": 1,
    "email": "user@gmail.com",
    "fullName": "John Doe",
    "role": "user",
    "status": false
  }
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `400 Bad Request` - Invalid Google token
- `401 Unauthorized` - Authentication failed

---

### POST /register
User registration.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "Jane Doe"
}
```

**Success Response:**
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "fullName": "Jane Doe",
  "role": "user",
  "isPremium": false,
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T10:00:00.000Z"
}
```
**Status Code:** `201 Created`

**Error Responses:**
- `400 Bad Request` - Validation errors or duplicate email
- `500 Internal Server Error` - Database error

---

## User Management

> **Authentication Required:** All endpoints below require valid access token in `Authorization: Bearer <token>` header.

### GET /user/:id/profile
Get user profile information.

**Parameters:**
- `id` (path parameter) - User ID

**Success Response:**
```json
{
  "id": 1,
  "UserId": 1,
  "displayName": "John Doe",
  "profilePicture": "https://example.com/picture.jpg",
  "isPremium": false,
  "fullName": "John Doe",
  "email": "user@example.com",
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T10:00:00.000Z"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `404 Not Found` - User not found
- `401 Unauthorized` - Authentication required

---

### PUT /user/:id/profile
Update or create user profile (upsert).

**Parameters:**
- `id` (path parameter) - User ID

**Request Body:**
```json
{
  "displayName": "John Smith",
  "profilePicture": "https://example.com/new-picture.jpg"
}
```

**Success Response:**
```json
{
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "UserId": 1,
    "displayName": "John Smith",
    "profilePicture": "https://example.com/new-picture.jpg",
    "isPremium": false,
    "fullName": "John Doe",
    "email": "user@example.com",
    "createdAt": "2025-09-17T10:00:00.000Z",
    "updatedAt": "2025-09-17T10:30:00.000Z"
  }
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `404 Not Found` - User not found
- `401 Unauthorized` - Authentication required

---

### PATCH /user/:id/profile
Update profile picture (file upload).

**Parameters:**
- `id` (path parameter) - User ID

**Request Body:** `multipart/form-data`
- `imgUrl` (file) - Image file to upload

**Success Response:**
```json
{
  "message": "Profile picture updated successfully",
  "profilePicture": "https://cloudinary.com/uploaded-image-url.jpg"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `400 Bad Request` - No file uploaded
- `404 Not Found` - User not found
- `401 Unauthorized` - Authentication required
- `500 Internal Server Error` - File upload failed

---

## User Progress Management

### POST /user/:id/progress
Create user progress for a language.

**Parameters:**
- `id` (path parameter) - User ID

**Request Body:**
```json
{
  "languageId": 1,
  "progress": {
    "completed": false,
    "percentage": 25,
    "lessons": ["lesson1", "lesson2"]
  }
}
```

**Success Response:**
```json
{
  "id": 1,
  "userId": 1,
  "languageId": 1,
  "progress": {
    "completed": false,
    "percentage": 25,
    "lessons": ["lesson1", "lesson2"]
  },
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T10:00:00.000Z"
}
```
**Status Code:** `201 Created`

**Error Responses:**
- `404 Not Found` - User not found
- `409 Conflict` - You are already registered for this language!
- `401 Unauthorized` - Authentication required

---

### GET /user/:id/progress
Get all user progress.

**Parameters:**
- `id` (path parameter) - User ID

**Success Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "languageId": 1,
    "progress": {
      "completed": false,
      "percentage": 75,
      "lessons": ["lesson1", "lesson2", "lesson3"]
    },
    "Language": {
      "id": 1,
      "name": "English"
    },
    "createdAt": "2025-09-17T10:00:00.000Z",
    "updatedAt": "2025-09-17T11:00:00.000Z"
  }
]
```
**Status Code:** `200 OK`

**Error Responses:**
- `404 Not Found` - User not found
- `401 Unauthorized` - Authentication required

---

### GET /user/:id/progress/:languageId
Get user progress for specific language.

**Parameters:**
- `id` (path parameter) - User ID
- `languageId` (path parameter) - Language ID

**Success Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "languageId": 1,
    "progress": {
      "completed": false,
      "percentage": 75,
      "lessons": ["lesson1", "lesson2", "lesson3"]
    },
    "createdAt": "2025-09-17T10:00:00.000Z",
    "updatedAt": "2025-09-17T10:30:00.000Z"
  }
]
```
**Status Code:** `200 OK`

**Error Responses:**
- `404 Not Found` - User or progress not found
- `401 Unauthorized` - Authentication required

---

### PUT /user/:id/progress/:languageId
Update user progress for specific language.

**Parameters:**
- `id` (path parameter) - User ID
- `languageId` (path parameter) - Language ID

**Request Body:**
```json
{
  "progress": {
    "completed": true,
    "percentage": 100,
    "lessons": ["lesson1", "lesson2", "lesson3", "lesson4"]
  }
}
```

**Success Response:**
```json
{
  "id": 1,
  "userId": 1,
  "languageId": 1,
  "progress": {
    "completed": true,
    "percentage": 100,
    "lessons": ["lesson1", "lesson2", "lesson3", "lesson4"]
  },
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T12:00:00.000Z"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `404 Not Found` - User or progress not found
- `401 Unauthorized` - Authentication required

---

## Language Management

### GET /languages
Get all available languages.

**Success Response:**
```json
[
  {
    "id": 1,
    "name": "English",
    "imageUrl": "https://example.com/english.jpg",
    "createdAt": "2025-09-17T10:00:00.000Z",
    "updatedAt": "2025-09-17T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Spanish",
    "imageUrl": "https://example.com/spanish.jpg",
    "createdAt": "2025-09-17T10:00:00.000Z",
    "updatedAt": "2025-09-17T10:00:00.000Z"
  }
]
```
**Status Code:** `200 OK`

---

### GET /languages/:id
Get specific language by ID.

**Parameters:**
- `id` (path parameter) - Language ID

**Success Response:**
```json
{
  "id": 1,
  "name": "English",
  "imageUrl": "https://example.com/english.jpg",
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T10:00:00.000Z"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `400 Bad Request` - Invalid language ID format
- `404 Not Found` - Language not found

---

## Course Management

### GET /courses
Get all available courses.

> **Premium Access Required:** This endpoint requires premium subscription.

**Success Response:**
```json
[
  {
    "id": 1,
    "title": "English Fundamentals: Getting Started",
    "difficulty": "Beginner",
    "languageId": 1,
    "content": "{\"roadmap\":\"This course introduces...\",\"lessons\":[...]}",
    "createdAt": "2025-09-17T10:00:00.000Z",
    "updatedAt": "2025-09-17T10:00:00.000Z"
  }
]
```
**Status Code:** `200 OK`

**Error Responses:**
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - You are not authorized to access this resource (non-premium users)

---

### GET /courses/:id
Get specific course by ID.

**Parameters:**
- `id` (path parameter) - Course ID

**Success Response:**
```json
{
  "id": 1,
  "title": "English Fundamentals: Getting Started",
  "difficulty": "Beginner",
  "languageId": 1,
  "content": {
    "roadmap": "This course introduces the absolute basics of English...",
    "lessons": [
      {
        "title": "The English Alphabet & Basic Pronunciation",
        "content": "## The English Alphabet...",
        "difficulty": 1,
        "order": 1
      }
    ]
  },
  "Language": {
    "id": 1,
    "name": "English"
  },
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T10:00:00.000Z"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `400 Bad Request` - Invalid course ID format
- `404 Not Found` - Course not found

---

### GET /courses/language/:languageId
Get courses by language ID.

**Parameters:**
- `languageId` (path parameter) - Language ID

**Success Response:**
```json
[
  {
    "id": 1,
    "title": "English Fundamentals: Getting Started",
    "difficulty": "Beginner",
    "languageId": 1,
    "content": {
      "roadmap": "This course introduces...",
      "lessons": [...]
    },
    "createdAt": "2025-09-17T10:00:00.000Z",
    "updatedAt": "2025-09-17T10:00:00.000Z"
  },
  {
    "id": 2,
    "title": "English Intermediate: Building Skills",
    "difficulty": "Intermediate",
    "languageId": 1,
    "content": {
      "roadmap": "This course builds upon...",
      "lessons": [...]
    },
    "createdAt": "2025-09-17T10:00:00.000Z",
    "updatedAt": "2025-09-17T10:00:00.000Z"
  }
]
```
**Status Code:** `200 OK`

**Error Responses:**
- `400 Bad Request` - Invalid language ID format

---

### POST /courses
Create a new course using AI generation (Staff only).

**Request Body:**
```json
{
  "language": "Spanish"
}
```

**Success Response:**
```json
{
  "courses": [
    {
      "id": 2,
      "title": "Spanish Fundamentals: Getting Started",
      "difficulty": "Beginner",
      "languageId": 2,
      "content": {
        "roadmap": "AI-generated course content...",
        "lessons": [
          {
            "title": "Spanish Alphabet & Basic Pronunciation",
            "content": "## El Alfabeto Español...",
            "difficulty": 1,
            "order": 1
          }
        ]
      },
      "createdAt": "2025-09-17T10:00:00.000Z",
      "updatedAt": "2025-09-17T10:00:00.000Z"
    }
  ]
}
```
**Status Code:** `201 Created`

**Error Responses:**
- `401 Unauthorized` - No authorization header
- `403 Forbidden` - You are not authorized to access this resource

---

## Transaction Management

> **Authentication Required:** All endpoints below require valid access token in `Authorization: Bearer <token>` header.

### POST /transactions/create-order
Create a new transaction order with Midtrans.

**Request Body:**
```json
{
  "userId": 1,
  "amount": 50000
}
```

**Success Response:**
```json
{
  "message": "Order created successfully",
  "parameter": {
    "transaction_details": {
      "order_id": "ORD-1-123456",
      "gross_amount": 50000
    },
    "credit_card": {
      "secure": true
    },
    "customer_details": {
      "id": 1,
      "user_name": "John Doe",
      "first_name": "John Doe",
      "email": "user@example.com"
    },
    "callbacks": {
      "finish": "http://localhost:5173/payment?status=finished"
    }
  }
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `401 Unauthorized` - No authorization header, No token provided, or Invalid token
- `404 Not Found` - User not found with the provided userId
- `400 Bad Request` - Missing required fields (userId and amount are required)
- `400 Bad Request` - Invalid data types or values (e.g., negative amounts, zero amounts, or extremely large amounts)
- `500 Internal Server Error` - Database connection errors, User.findByPk errors, or other server-side issues

---

### POST /transactions/create-transaction
Create Midtrans transaction token.

**Request Body:**
```json
{
  "parameter": {
    "transaction_details": {
      "order_id": "ORDER-123-1695807600",
      "gross_amount": 50000
    },
    "credit_card": {
      "secure": true
    },
    "customer_details": {
      "id": 1,
      "user_name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

**Success Response:**
```json
{
  "message": "Transaction created successfully",
  "token": "66e4fa55-fdac-4ef9-91b5-1c25f6f04bdf"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `401 Unauthorized` - No authorization header, No token provided, or Invalid token
- `400 Bad Request` - Parameter is required
- `400 Bad Request` - Invalid parameter structure. transaction_details with order_id and gross_amount are required
- `400 Bad Request` - Missing transaction_details.order_id
- `400 Bad Request` - Missing transaction_details.gross_amount
- `400 Bad Request` - Completely missing transaction_details object
- `500 Internal Server Error` - Midtrans service unavailable or API errors

---

### POST /transactions/transaction-status
Handle Midtrans payment notification webhook.

> **Note:** This endpoint is typically called by Midtrans servers, not directly by client applications.

**Request Body:**
```json
{
  "transaction_time": "2025-09-18 10:30:00",
  "transaction_status": "capture",
  "transaction_id": "12345-67890-abcdef",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "signature_from_midtrans",
  "payment_type": "credit_card",
  "order_id": "ORD-1-123456",
  "merchant_id": "merchant_id",
  "gross_amount": "50000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

**Success Response Examples:**

**Successful Payment (capture/settlement with accept fraud status):**
```json
{
  "message": "Transaction accept"
}
```
**Status Code:** `200 OK`

**Transaction Denied/Cancelled/Expired:**
```json
{
  "message": "Transaction reject"
}
```
**Status Code:** `200 OK`

**Pending Transaction:**
```json
{
  "message": "Transaction challenge"
}
```
**Status Code:** `200 OK`

**Settlement without fraud status:**
```json
{
  "message": "Transaction undefined"
}
```
**Status Code:** `200 OK`

**Unknown/Unhandled Transaction Status:**
```json
{
  "message": "Notification received"
}
```
**Status Code:** `200 OK`

**Database/Processing Error (always returns 200 to prevent Midtrans retries):**
```json
{
  "message": "Notification received but error occurred"
}
```
**Status Code:** `200 OK`

**Transaction Status Handling:**
- `capture` with `fraud_status: "accept"` → User upgraded to premium, transaction marked as success
- `settlement` → User upgraded to premium, transaction marked as success
- `deny`, `cancel`, `expire` → Transaction marked as failure
- `pending` → Transaction remains pending
- Unknown statuses → Acknowledged but no action taken

**Error Responses:**
- `200 OK` - Even in error cases, returns 200 to prevent Midtrans retry loops
- Missing order_id: Returns acknowledgment with "Notification received" message
- Invalid notification data: Returns acknowledgment to prevent endless retries
- Database errors: Returns "Notification received but error occurred" message
- Malformed request body: Returns acknowledgment message

> **Important:** This endpoint always returns HTTP 200 status codes to prevent Midtrans from retrying failed notifications indefinitely. Error conditions are handled gracefully and logged server-side.

---

## Question Management

### GET /questions
Get all questions (can be filtered by courseId query parameter).

**Query Parameters:**
- `courseId` (optional) - Filter questions by course ID

**Success Response:**
```json
[
  {
    "id": 1,
    "questionName": "Which letter is a vowel?",
    "courseId": 1,
    "choices": {
      "A": "B",
      "B": "F", 
      "C": "I",
      "D": "T"
    },
    "answer": "C",
    "createdAt": "2025-09-17T10:00:00.000Z",
    "updatedAt": "2025-09-17T10:00:00.000Z"
  }
]
```
**Status Code:** `200 OK`

---

### GET /questions/course/:courseId
Get all questions for a specific course.

**Parameters:**
- `courseId` (path parameter) - Course ID (must be a valid integer)

**Success Response:**
```json
[
  {
    "id": 1,
    "questionName": "Which letter is a vowel?",
    "courseId": 1,
    "choices": {
      "A": "B",
      "B": "F", 
      "C": "I",
      "D": "T"
    },
    "answer": "C",
    "createdAt": "2025-09-17T10:00:00.000Z",
    "updatedAt": "2025-09-17T10:00:00.000Z"
  },
  {
    "id": 2,
    "questionName": "What is JavaScript?",
    "courseId": 1,
    "choices": {
      "A": "A programming language",
      "B": "A coffee type",
      "C": "A framework",
      "D": "A library"
    },
    "answer": "A",
    "createdAt": "2025-09-17T10:00:00.000Z",
    "updatedAt": "2025-09-17T10:00:00.000Z"
  }
]
```
**Status Code:** `200 OK`

**Notes:**
- Returns an empty array `[]` if no questions exist for the specified course
- All returned questions will have the same `courseId` as specified in the path parameter
- Questions are returned in consistent order (database insertion order)

**Error Responses:**
- `400 Bad Request` - Invalid course ID format (courseId must be a valid integer)
- `401 Unauthorized` - No authorization header
- `500 Internal Server Error` - Database connection failed

---

### GET /questions/:id
Get specific question by ID.

**Parameters:**
- `id` (path parameter) - Question ID

**Success Response:**
```json
{
  "id": 1,
  "questionName": "Which letter is a vowel?",
  "courseId": 1,
  "choices": {
    "A": "B",
    "B": "F", 
    "C": "I",
    "D": "T"
  },
  "answer": "C",
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T10:00:00.000Z"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `400 Bad Request` - Invalid question ID format
- `404 Not Found` - Question not found---

### POST /questions
Create a new question.

**Request Body:**
```json
{
  "questionName": "Which letter is a vowel?",
  "answer": "C",
  "courseId": 1,
  "choices": {
    "A": "B",
    "B": "F",
    "C": "I", 
    "D": "T"
  }
}
```

**Success Response:**
```json
{
  "id": 2,
  "questionName": "Which letter is a vowel?",
  "courseId": 1,
  "choices": {
    "A": "B",
    "B": "F", 
    "C": "I",
    "D": "T"
  },
  "answer": "C",
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T10:00:00.000Z"
}
```
**Status Code:** `201 Created`

**Error Responses:**
- `400 Bad Request` - Text, answer, and courseId are required
- `400 Bad Request` - Invalid courseId format
- `401 Unauthorized` - No authorization header
- `403 Forbidden` - You are not authorized to access this resource

---

## Admin CMS Endpoints

> **Admin Authorization Required:** All endpoints below require admin role.

### GET /users
Get all users (Admin only).

**Success Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "isPremium": false,
    "createdAt": "2025-09-17T10:00:00.000Z",
    "updatedAt": "2025-09-17T10:00:00.000Z"
  }
]
```
**Status Code:** `200 OK`

**Error Responses:**
- `403 Forbidden` - Admin access required

---

### DELETE /users/:id
Delete user (Admin only).

**Parameters:**
- `id` (path parameter) - User ID

**Success Response:**
```json
{
  "message": "User deleted successfully"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `403 Forbidden` - Admin access required
- `404 Not Found` - User not found

---

### POST /languages
Create a new language (Staff only).

**Request Body:**
```json
{
  "name": "French"
}
```

**Success Response:**
```json
{
  "id": 3,
  "name": "French",
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T10:00:00.000Z"
}
```
**Status Code:** `201 Created`

**Error Responses:**
- `401 Unauthorized` - No authorization header
- `403 Forbidden` - You are not authorized to access this resource

---

### DELETE /languages/:id
Delete language (Staff only).

**Parameters:**
- `id` (path parameter) - Language ID

**Success Response:**
- Status Code: `204 No Content`

**Error Responses:**
- `400 Bad Request` - Invalid language ID format
- `401 Unauthorized` - No authorization header
- `403 Forbidden` - You are not authorized to access this resource
- `404 Not Found` - Language not found

---

### PUT /courses/:id
Update course (Staff only).

**Parameters:**
- `id` (path parameter) - Course ID

**Request Body:**
```json
{
  "title": "Updated Course Title",
  "description": "Updated description",
  "languageId": 1
}
```

**Success Response:**
```json
{
  "id": 1,
  "title": "Updated Course Title",
  "description": "Updated description",
  "languageId": 1,
  "content": "{\"roadmap\":\"Updated content...\",\"lessons\":[...]}",
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T12:00:00.000Z"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `401 Unauthorized` - No authorization header
- `403 Forbidden` - You are not authorized to access this resource
- `404 Not Found` - Course not found

---

### DELETE /courses/:id
Delete course (Staff only).

**Parameters:**
- `id` (path parameter) - Course ID

**Success Response:**
- Status Code: `204 No Content`

**Error Responses:**
- `401 Unauthorized` - No authorization header
- `403 Forbidden` - You are not authorized to access this resource
- `404 Not Found` - Course not found

---

### PUT /questions/:id
Update question (Staff only).

**Parameters:**
- `id` (path parameter) - Question ID

**Request Body:**
```json
{
  "text": "Updated question text?",
  "answer": "A",
  "courseId": 1
}
```

**Success Response:**
```json
{
  "id": 1,
  "questionName": "Updated question text?",
  "courseId": 1,
  "choices": {
    "A": "Option A",
    "B": "Option B",
    "C": "Option C",
    "D": "Option D"
  },
  "answer": "A",
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T12:00:00.000Z"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `401 Unauthorized` - No authorization header
- `403 Forbidden` - You are not authorized to access this resource
- `404 Not Found` - Question not found

---

### DELETE /questions/:id
Delete question (Staff only).

**Parameters:**
- `id` (path parameter) - Question ID

**Success Response:**
- Status Code: `204 No Content`

**Error Responses:**
- `401 Unauthorized` - No authorization header
- `403 Forbidden` - You are not authorized to access this resource
- `404 Not Found` - Question not found

---

## Data Models

### User
```json
{
  "id": "integer",
  "email": "string (unique, email format)",
  "password": "string (hashed)",
  "fullName": "string",
  "role": "string (User|admin)",
  "isPremium": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Profile
```json
{
  "id": "integer",
  "displayName": "string",
  "profilePicture": "string (URL)",
  "UserId": "integer (foreign key)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Language
```json
{
  "id": "integer",
  "name": "string",
  "imageUrl": "string (URL)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Course
```json
{
  "id": "integer",
  "title": "string",
  "difficulty": "string (Beginner|Intermediate|Advanced)",
  "languageId": "integer (foreign key)",
  "content": "JSON object",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Question
```json
{
  "id": "integer",
  "questionName": "string",
  "courseId": "integer (foreign key)",
  "choices": "JSON object",
  "answer": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### UserProgress
```json
{
  "id": "integer",
  "userId": "integer (foreign key)",
  "languageId": "integer (foreign key)",
  "progress": "JSON object",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Transaction
```json
{
  "id": "integer",
  "userId": "integer (foreign key)",
  "amount": "integer",
  "providerOrderId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## Authentication Header

For all authenticated endpoints, include the following header:

```
Authorization: Bearer <your_access_token>
```

---

## Content Types

All request and response bodies use `application/json` content type unless otherwise specified.

---

## Rate Limiting

Currently, no rate limiting is implemented. This may be added in future versions.

---

*Last updated: September 18, 2025*