const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env explicitly
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000 // Increased limit for local development testing
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Database connection
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-elearning';
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected to external uri');
  } catch (err) {
    console.log('MongoDB connection error, falling back to memory server:', err.message);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected to in-memory database');
      const seedData = require('./utils/seedData');
      console.log('Seeding in-memory database...');
      await seedData();
      console.log('In-memory database seeded successfully');
    } catch (memErr) {
      console.error('Failed to start in-memory database:', memErr.message);
    }
  }
};
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Smart E-Learning Platform API', status: 'running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/quizzes', require('./routes/quiz'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/recommendations', require('./routes/recommendations'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;