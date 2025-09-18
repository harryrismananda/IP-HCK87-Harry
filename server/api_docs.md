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
  "message": "Access token is required"
}
```
**Status Code:** `401 Unauthorized`

```json
{
  "message": "Invalid token"
}
```
**Status Code:** `401 Unauthorized`

### Authorization Errors
```json
{
  "message": "Access denied. Admin only."
}
```
**Status Code:** `403 Forbidden`

```json
{
  "message": "Premium access required"
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

### Not Found Errors
```json
{
  "message": "Resource not found"
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
- `401 Unauthorized` - Invalid credentials

---

### POST /google-login
User login with Google OAuth.

**Request Body:**
```json
{
  "google_token": "google_oauth_token_here"
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
- `409 Conflict` - User already registered for this language
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
- `403 Forbidden` - Premium access required

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
- `404 Not Found` - Course not found
- `400 Bad Request` - Invalid course ID format

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
Create a new course using AI generation.

**Request Body:**
```json
{
  "language": "Spanish"
}
```

**Success Response:**
```json
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
```
**Status Code:** `201 Created`

**Error Responses:**
- `400 Bad Request` - Validation errors
- `500 Internal Server Error` - AI generation failed or language not found

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
**Status Code:** `200 OK`

**Error Responses:**
- `401 Unauthorized` - Authentication required
- `404 Not Found` - User not found
- `400 Bad Request` - Missing required fields
- `500 Internal Server Error` - Database or Midtrans error

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
- `401 Unauthorized` - Authentication required
- `400 Bad Request` - Invalid parameter structure
- `500 Internal Server Error` - Midtrans API error

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
  "order_id": "ORDER-123-1695807600",
  "merchant_id": "merchant_id",
  "gross_amount": "50000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

**Success Response:**
```json
{
  "message": "Notification received",
  "transactionStatus": "capture"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `400 Bad Request` - Transaction not successful (status not capture/settlement)
- `500 Internal Server Error` - Midtrans notification processing error

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
- `404 Not Found` - Question not found

---

### POST /questions
Create a new question using AI generation.

**Request Body:**
```json
{
  "text": "Generate questions for this course",
  "answer": "Correct answer",
  "courseId": 1
}
```

**Success Response:**
```json
{
  "id": 2,
  "questionName": "AI-generated question text",
  "courseId": 1,
  "choices": {
    "A": "Option A",
    "B": "Option B", 
    "C": "Option C",
    "D": "Option D"
  },
  "answer": "A",
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T10:00:00.000Z"
}
```
**Status Code:** `201 Created`

**Error Responses:**
- `400 Bad Request` - Validation errors
- `500 Internal Server Error` - AI generation failed

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
Create a new language (Admin only).

**Request Body:**
```json
{
  "name": "French",
  "imageUrl": "https://example.com/french.jpg"
}
```

**Success Response:**
```json
{
  "id": 3,
  "name": "French",
  "imageUrl": "https://example.com/french.jpg",
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T10:00:00.000Z"
}
```
**Status Code:** `201 Created`

**Error Responses:**
- `403 Forbidden` - Admin access required
- `400 Bad Request` - Validation errors

---

### DELETE /languages/:id
Delete language (Admin only).

**Parameters:**
- `id` (path parameter) - Language ID

**Success Response:**
```json
{
  "message": "Language deleted successfully"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `403 Forbidden` - Admin access required
- `404 Not Found` - Language not found

---

### PUT /courses/:id
Update course (Admin only).

**Parameters:**
- `id` (path parameter) - Course ID

**Request Body:**
```json
{
  "title": "Updated Course Title",
  "difficulty": "Intermediate",
  "content": "{\"roadmap\":\"Updated content...\",\"lessons\":[...]}"
}
```

**Success Response:**
```json
{
  "id": 1,
  "title": "Updated Course Title",
  "difficulty": "Intermediate",
  "languageId": 1,
  "content": "{\"roadmap\":\"Updated content...\",\"lessons\":[...]}",
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T12:00:00.000Z"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `403 Forbidden` - Admin access required
- `404 Not Found` - Course not found
- `400 Bad Request` - Validation errors

---

### DELETE /courses/:id
Delete course (Admin only).

**Parameters:**
- `id` (path parameter) - Course ID

**Success Response:**
```json
{
  "message": "Course deleted successfully"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `403 Forbidden` - Admin access required
- `404 Not Found` - Course not found

---

### PUT /questions/:id
Update question (Admin only).

**Parameters:**
- `id` (path parameter) - Question ID

**Request Body:**
```json
{
  "questionName": "Updated question text?",
  "choices": {
    "A": "Option A",
    "B": "Option B",
    "C": "Option C", 
    "D": "Option D"
  },
  "answer": "A"
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
- `403 Forbidden` - Admin access required
- `404 Not Found` - Question not found
- `400 Bad Request` - Validation errors

---

### DELETE /questions/:id
Delete question (Admin only).

**Parameters:**
- `id` (path parameter) - Question ID

**Success Response:**
```json
{
  "message": "Question deleted successfully"
}
```
**Status Code:** `200 OK`

**Error Responses:**
- `403 Forbidden` - Admin access required
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