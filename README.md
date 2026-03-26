# Smart E-Learning Platform

A comprehensive e-learning platform built with the MEAN stack (MongoDB, Express.js, Angular, Node.js) featuring AI/ML-powered personalized course recommendations.

## Features

### Core Features
- **User Authentication**: JWT-based authentication for students and instructors
- **Course Management**: Create, enroll, and manage courses with multimedia content
- **Quiz System**: Interactive quizzes with multiple question types
- **Progress Tracking**: Detailed learning progress and analytics
- **AI Recommendations**: Personalized course and content recommendations
- **Gamification**: Points, levels, badges, and leaderboards
- **Responsive Design**: Mobile-friendly interface

### AI/ML Features
- **Content-Based Filtering**: Recommendations based on user interests and course content
- **Collaborative Filtering**: Suggestions based on similar users' preferences
- **Performance-Based Recommendations**: Courses suggested based on quiz performance
- **Learning Pattern Analysis**: Insights into user learning habits and preferences

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Joi** - Input validation

### Frontend
- **Angular** - Frontend framework
- **TypeScript** - Programming language
- **Bootstrap 5** - CSS framework
- **Chart.js** - Data visualization
- **RxJS** - Reactive programming

### AI/ML
- **Custom Recommendation Engine** - Content-based and collaborative filtering
- **Performance Analytics** - Learning pattern analysis

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/smart-elearning
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=12
   ```

5. Start MongoDB service

6. Seed the database (optional):
   ```bash
   npm run seed
   ```

7. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Important Development Notes
- **In-Memory Database**: If a local MongoDB instance is not found on port 27017, the server will automatically fall back to an **in-memory database** (`mongodb-memory-server`) that resets on every server restart.
- **Default Seed Data**: Running the seeder script populates the database with 6 distinct courses (with Unsplash thumbnails), 2 interactive quizzes, and 3 sample users.
- **Test Credentials**: You can log in using the seeded student credentials: `john@example.com` / `password123`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be running on `http://localhost:4200`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user profile

### Course Endpoints
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Instructor only)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/courses/:id/enroll` - Enroll in course

### Quiz Endpoints
- `GET /api/quizzes` - Get quizzes
- `GET /api/quizzes/:id` - Get single quiz
- `POST /api/quizzes` - Create quiz
- `PUT /api/quizzes/:id` - Update quiz
- `POST /api/quizzes/:id/attempt` - Submit quiz attempt

### Analytics Endpoints
- `GET /api/analytics/user` - User analytics
- `GET /api/analytics/courses/:courseId` - Course analytics
- `GET /api/analytics/quizzes/:quizId` - Quiz analytics

### Recommendation Endpoints
- `GET /api/recommendations/courses` - Course recommendations
- `GET /api/recommendations/quizzes` - Quiz recommendations
- `GET /api/recommendations/topics` - Topic recommendations

## Project Structure

```
smart-elearning-platform/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── quizController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Lesson.js
│   │   ├── Quiz.js
│   │   └── Result.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── quiz.js
│   │   ├── analytics.js
│   │   ├── leaderboard.js
│   │   ├── progress.js
│   │   └── recommendations.js
│   ├── utils/
│   │   ├── aiEngine.js
│   │   └── seedData.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   ├── pages/
│   │   │   │   ├── home/
│   │   │   │   ├── dashboard/
│   │   │   │   └── ...
│   │   │   ├── services/
│   │   │   │   └── api.service.ts
│   │   │   ├── app.config.ts
│   │   │   ├── app.routes.ts
│   │   │   ├── app.component.ts
│   │   │   └── auth.interceptor.ts
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── package.json
│   └── angular.json
└── README.md
```

## Database Models

### User Model
- Personal information (name, email, password)
- Role (student/instructor/admin)
- Learning preferences (interests, learning style, difficulty)
- Progress tracking (enrolled courses, quiz results)
- Gamification (points, level, streak, badges)

### Course Model
- Course details (title, description, category, level)
- Content (lessons, quizzes)
- Enrollment and reviews
- Analytics (ratings, completion rates)

### Quiz Model
- Quiz configuration (questions, settings, scoring)
- Attempt tracking and results
- Performance analytics

## AI Recommendation System

The platform uses a hybrid recommendation approach:

1. **Content-Based Filtering**: Analyzes course content and user interests
2. **Collaborative Filtering**: Finds similar users and recommends their courses
3. **Performance-Based**: Suggests courses based on quiz performance and weak areas
4. **Popularity-Based**: Fallback recommendations for new users

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.