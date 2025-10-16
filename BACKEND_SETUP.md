# Healthy Food Backend Integration

This document explains how to set up and run the backend API for the Healthy Food marketplace.

## Backend Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

3. **The server will run on:** `http://localhost:3000`

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "userType": "farmer",
    "additionalInfo": "Fresno, CA",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/signup`
Create a new account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "userType": "farmer",
  "additionalInfo": "Fresno, CA"
}
```

**Response (Success):**
```json
{
  "message": "Account created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "userType": "farmer",
    "additionalInfo": "Fresno, CA",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/user/profile`
Get user profile (requires authentication).

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "userType": "farmer",
  "additionalInfo": "Fresno, CA",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Frontend Integration

The frontend is already configured to work with these endpoints. The JavaScript code includes:

1. **Login Process:**
   - Sends POST request to `/api/auth/login`
   - Stores JWT token in localStorage
   - Updates UI to show logged-in state
   - Shows success/error messages

2. **Signup Process:**
   - Sends POST request to `/api/auth/signup`
   - Stores JWT token in localStorage
   - Redirects to dashboard (simulated)

3. **Authentication State:**
   - Checks for stored token on page load
   - Updates navigation for logged-in users
   - Provides logout functionality

## Security Features

- **Password Hashing:** Uses bcryptjs for secure password storage
- **JWT Tokens:** Secure authentication tokens with 24-hour expiration
- **CORS:** Configured for cross-origin requests
- **Input Validation:** Basic validation for required fields

## Production Considerations

For production deployment, consider:

1. **Database Integration:** Replace in-memory storage with a real database (MongoDB, PostgreSQL, etc.)
2. **Environment Variables:** Use environment variables for JWT secret and database credentials
3. **Rate Limiting:** Implement rate limiting for authentication endpoints
4. **HTTPS:** Ensure all communication is over HTTPS
5. **Token Blacklisting:** Implement token blacklisting for logout functionality
6. **Input Sanitization:** Add more robust input validation and sanitization
7. **Error Handling:** Implement comprehensive error handling and logging

## Testing the Integration

1. Start the backend server
2. Open the frontend HTML file in a browser
3. Try creating a new account
4. Try logging in with the created account
5. Verify the UI updates correctly for logged-in users

## Troubleshooting

- **CORS Issues:** Make sure the backend server is running and CORS is properly configured
- **Network Errors:** Check that the frontend is making requests to the correct backend URL
- **Token Issues:** Verify JWT secret is consistent between frontend and backend
- **Port Conflicts:** Ensure port 3000 is available or change the port in the backend
