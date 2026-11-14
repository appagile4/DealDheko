# DealDheko - Backend API

RESTful API backend for the **DealDoko** classifieds marketplace (dealdoko.com).

## Tech Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas via Mongoose
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies
- **Email Service**: Nodemailer (Gmail SMTP) for 60-second expiring OTP verification
- **Media Storage**: Cloudinary for user profile avatars and listing images
- **Security**: CORS, bcryptjs password hashing, protected routes

## Endpoints

### Auth (`/api/auth`)
- `POST /api/auth/signup` - Register new user & send 6-digit OTP (expires in 1 min)
- `POST /api/auth/verify-otp` - Verify OTP, activate account & return JWT
- `POST /api/auth/resend-otp` - Resend fresh 6-digit OTP
- `POST /api/auth/login` - Authenticate user & issue JWT
- `POST /api/auth/logout` - Clear auth session cookie
- `GET /api/auth/me` - Get current authenticated user profile
- `PUT /api/auth/profile` - Update profile (immutable verified email)
- `POST /api/auth/avatar` - Upload profile picture to Cloudinary & store URL on MongoDB

### Upload (`/api/upload`)
- `POST /api/upload` - General Cloudinary image uploader (multipart/form-data)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` (refer to `.env.example`).

3. Start development server:
   ```bash
   npm run dev
   ```
