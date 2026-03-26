const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();
    await Quiz.deleteMany();

    console.log('Existing data cleared');

    // Create sample users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student',
        interests: ['programming', 'web-development'],
        learningStyle: 'visual',
        preferredDifficulty: 'beginner'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'instructor',
        bio: 'Experienced web developer and instructor'
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      }
    ]);

    console.log('Sample users created');

    // Create sample courses
    const courses = await Course.create([
      {
        title: 'Introduction to JavaScript',
        description: 'Learn the fundamentals of JavaScript programming',
        instructor: users[1]._id,
        category: 'programming',
        level: 'beginner',
        price: 49.99,
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
        lessons: [
          {
            title: 'Variables and Data Types',
            description: 'Learn about JavaScript variables and data types',
            videoUrl: 'https://example.com/video1.mp4',
            duration: 15,
            order: 1
          },
          {
            title: 'Functions and Scope',
            description: 'Understanding JavaScript functions and scope',
            videoUrl: 'https://example.com/video2.mp4',
            duration: 20,
            order: 2
          }
        ],
        quizzes: [],
        tags: ['javascript', 'programming', 'web-development'],
        learningObjectives: [
          'Understand JavaScript syntax',
          'Work with variables and data types',
          'Create functions and objects'
        ],
        duration: 10,
        totalLessons: 2,
        isPublished: true
      },
      {
        title: 'Advanced React Development',
        description: 'Master advanced React concepts and patterns',
        instructor: users[1]._id,
        category: 'programming',
        level: 'advanced',
        price: 99.99,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
        lessons: [
          {
            title: 'React Hooks Deep Dive',
            description: 'Advanced React hooks usage',
            videoUrl: 'https://example.com/video3.mp4',
            duration: 25,
            order: 1
          }
        ],
        quizzes: [],
        tags: ['react', 'javascript', 'frontend'],
        learningObjectives: [
          'Implement advanced React hooks',
          'Optimize React applications',
          'Build complex user interfaces'
        ],
        duration: 20,
        totalLessons: 1,
        isPublished: true
      },
      {
        title: 'Data Science Fundamentals',
        description: 'Introduction to data science and machine learning',
        instructor: users[1]._id,
        category: 'data-science',
        level: 'intermediate',
        price: 79.99,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
        lessons: [
          {
            title: 'Introduction to Data Science',
            description: 'Foundations of data analysis and machine learning',
            videoUrl: 'https://example.com/video4.mp4',
            duration: 30,
            order: 1
          }
        ],
        quizzes: [],
        tags: ['data-science', 'python', 'machine-learning'],
        learningObjectives: [
          'Understand data science concepts',
          'Work with Python for data analysis',
          'Build basic machine learning models'
        ],
        duration: 15,
        totalLessons: 1,
        isPublished: true
      },
      {
        title: 'UI/UX Design Masterclass',
        description: 'Learn to design beautiful and functional user interfaces',
        instructor: users[1]._id,
        category: 'design',
        level: 'intermediate',
        price: 89.99,
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
        lessons: [
          {
            title: 'Design Thinking Basics',
            description: 'Introduction to design thinking process',
            videoUrl: 'https://example.com/video5.mp4',
            duration: 25,
            order: 1
          }
        ],
        quizzes: [],
        tags: ['design', 'ui', 'ux', 'figma'],
        learningObjectives: [
          'Master Figma tools',
          'Understand color theory and typography',
          'Create high-fidelity prototypes'
        ],
        duration: 22,
        totalLessons: 1,
        isPublished: true
      },
      {
        title: 'Fullstack Web Development bootcamp',
        description: 'From zero to fullstack heroic developer',
        instructor: users[1]._id,
        category: 'programming',
        level: 'intermediate',
        price: 129.99,
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
        lessons: [
          {
            title: 'Frontend vs Backend',
            description: 'Architecture of modern web apps',
            videoUrl: 'https://example.com/video6.mp4',
            duration: 40,
            order: 1
          }
        ],
        quizzes: [],
        tags: ['web-development', 'node', 'react', 'fullstack'],
        learningObjectives: [
          'Build RESTful APIs',
          'Connect frontend to backend',
          'Deploy applications securely'
        ],
        duration: 45,
        totalLessons: 1,
        isPublished: true
      },
      {
        title: 'Digital Marketing 101',
        description: 'Master SEO, social media, and content marketing',
        instructor: users[1]._id,
        category: 'marketing',
        level: 'beginner',
        price: 59.99,
        thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&h=400&fit=crop',
        lessons: [
          {
            title: 'SEO Fundamentals',
            description: 'How to rank on Google\'s first page',
            videoUrl: 'https://example.com/video7.mp4',
            duration: 20,
            order: 1
          }
        ],
        quizzes: [],
        tags: ['marketing', 'seo', 'growth'],
        learningObjectives: [
          'Understand SEO basics',
          'Run profitable ad campaigns',
          'Grow social media audiences'
        ],
        duration: 18,
        totalLessons: 1,
        isPublished: true
      }
    ]);

    console.log('Sample courses created');

    // Create sample quizzes
    const quizzes = await Quiz.create([
      {
        title: 'JavaScript Basics Quiz',
        description: 'Test your knowledge of JavaScript fundamentals',
        course: courses[0]._id,
        instructor: users[1]._id,
        questions: [
          {
            question: 'What is the correct way to declare a variable in JavaScript?',
            type: 'mcq',
            options: ['var myVar;', 'variable myVar;', 'v myVar;', 'declare myVar;'],
            correctAnswer: 0,
            points: 1,
            explanation: 'The var keyword is used to declare variables in JavaScript.'
          },
          {
            question: 'Which of the following is NOT a JavaScript data type?',
            type: 'mcq',
            options: ['String', 'Number', 'Boolean', 'Character'],
            correctAnswer: 3,
            points: 1,
            explanation: 'JavaScript does not have a Character data type. It uses String for text.'
          },
          {
            question: 'What will console.log(typeof null) output?',
            type: 'mcq',
            options: ['null', 'undefined', 'object', 'boolean'],
            correctAnswer: 2,
            points: 1,
            explanation: 'In JavaScript, typeof null returns "object" due to a historical bug.'
          }
        ],
        settings: {
          timeLimit: 15,
          passingScore: 70,
          maxAttempts: 3
        },
        isPublished: true,
        totalQuestions: 3,
        totalPoints: 3
      },
      {
        title: 'React Advanced Concepts Quiz',
        description: 'Test your understanding of advanced React concepts',
        course: courses[1]._id,
        instructor: users[1]._id,
        questions: [
          {
            question: 'What is the purpose of useCallback hook?',
            type: 'mcq',
            options: [
              'To memoize functions',
              'To handle side effects',
              'To manage state',
              'To create context'
            ],
            correctAnswer: 0,
            points: 1,
            explanation: 'useCallback is used to memoize functions to prevent unnecessary re-renders.'
          }
        ],
        settings: {
          timeLimit: 20,
          passingScore: 75,
          maxAttempts: 2
        },
        isPublished: true,
        totalQuestions: 1,
        totalPoints: 1
      }
    ]);

    console.log('Sample quizzes created');

    // Update courses with quizzes
    await Course.findByIdAndUpdate(courses[0]._id, {
      quizzes: [quizzes[0]._id]
    });

    await Course.findByIdAndUpdate(courses[1]._id, {
      quizzes: [quizzes[1]._id]
    });

    // Enroll student in courses
    await User.findByIdAndUpdate(users[0]._id, {
      enrolledCourses: [
        {
          course: courses[0]._id,
          enrolledAt: new Date()
        }
      ]
    });

    console.log('Data seeding completed successfully');
    console.log('Sample data created:');
    console.log('- 3 users (1 student, 1 instructor, 1 admin)');
    console.log('- 6 courses');
    console.log('- 7 embedded lessons');
    console.log('- 2 quizzes');

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

module.exports = seedData;

if (require.main === module) {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-elearning';

  mongoose.connect(mongoUri)
    .then(async () => {
      console.log('MongoDB connected');
      await seedData();
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
    })
    .catch(async (error) => {
      console.error('Error seeding database:', error);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    });
}
