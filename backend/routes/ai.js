// backend/routes/ai.js
// AI-Powered Features: Recommendations, Summarization, Career Guidance, Analysis
// Available to all authenticated users

const router = require('express').Router();
let prisma;
try {
  prisma = new (require('@prisma/client')).PrismaClient();
} catch (e) {
  console.error('Prisma not available:', e.message);
}
const aiService = require('../services/aiService');

// ── POST /api/ai/recommendations ─────────────────────────────────────────
// Get personalized course recommendations based on student profile
router.post('/recommendations', async (req, res) => {
  try {
    // Check NVIDIA API key
    if (!process.env.NVIDIA_API_KEY) {
      return res.status(500).json({ error: 'NVIDIA API key not configured on server' });
    }

    const { sessionId, grades, interests, currentCourses, careerGoal, limit } = req.body;
    
    if (!sessionId || !grades) {
      return res.status(400).json({ error: 'sessionId and grades required' });
    }

    // Check database availability
    if (!prisma) {
      return res.status(500).json({ error: 'Database not configured on server' });
    }

    // Fetch available courses
    const availableCourses = await prisma.course.findMany({
      take: limit || 30,
      orderBy: { demand: 'desc' }
    });

    if (availableCourses.length === 0) {
      return res.status(400).json({ error: 'No courses available' });
    }

    // Get AI recommendations
    const recommendations = await aiService.getRecommendations({
      grades,
      interests,
      currentCourses,
      careerGoal,
      availableCourses
    });

    // Log the AI query
    await prisma.aiMessage.create({
      data: {
        sessionId,
        role: 'system',
        content: `AI Recommendations generated. Input: ${JSON.stringify({ grades, interests })}`
      }
    });

    res.json({ recommendations, generated_at: new Date() });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// ── POST /api/ai/summarize-course ───────────────────────────────────────
// Get AI summary of a specific course
router.post('/summarize-course', async (req, res) => {
  try {
    const { sessionId, courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ error: 'courseId required' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const summary = await aiService.summarizeCourse(course);

    if (sessionId) {
      await prisma.aiMessage.create({
        data: {
          sessionId,
          role: 'system',
          content: `Course summary requested: ${course.name}`
        }
      });
    }

    res.json({ course: course.name, summary, generated_at: new Date() });
  } catch (err) {
    console.error('Summarize error:', err);
    res.status(500).json({ error: 'Failed to summarize course' });
  }
});

// ── POST /api/ai/career-guidance ────────────────────────────────────────
// Get personalized career path guidance
router.post('/career-guidance', async (req, res) => {
  try {
    const { sessionId, interests, strengths, currentCourses, grades, careerGoal } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    const guidance = await aiService.getCareerGuidance({
      interests,
      strengths,
      currentCourses,
      grades,
      careerGoal
    });

    await prisma.aiMessage.create({
      data: {
        sessionId,
        role: 'system',
        content: `Career guidance generated for interest: ${careerGoal || interests}`
      }
    });

    res.json({ guidance, generated_at: new Date() });
  } catch (err) {
    console.error('Career guidance error:', err);
    res.status(500).json({ error: 'Failed to generate career guidance' });
  }
});

// ── POST /api/ai/progress-analysis ──────────────────────────────────────
// Analyze student's progress and engagement
router.post('/progress-analysis', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    const session = await prisma.session.findUnique({ where: { sessionId } });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const messages = await prisma.aiMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const analysis = await aiService.analyzeStudentProgress(session, messages);

    res.json({ analysis, sessionInfo: { studentName: session.firstName, queries: session.aiQueries }, generated_at: new Date() });
  } catch (err) {
    console.error('Progress analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze progress' });
  }
});

// ── POST /api/ai/practice-questions ────────────────────────────────────
// Generate practice questions for a course
router.post('/practice-questions', async (req, res) => {
  try {
    const { sessionId, courseId, difficulty } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ error: 'courseId required' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const questions = await aiService.generatePracticeQuestions(course, difficulty || 'medium');

    if (sessionId) {
      await prisma.aiMessage.create({
        data: {
          sessionId,
          role: 'system',
          content: `Practice questions generated for: ${course.name}`
        }
      });
    }

    res.json({ course: course.name, questions, difficulty: difficulty || 'medium', generated_at: new Date() });
  } catch (err) {
    console.error('Practice questions error:', err);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// ── POST /api/ai/tutor ─────────────────────────────────────────────────
// AI Tutor - Answer student questions in context
router.post('/tutor', async (req, res) => {
  try {
    const { sessionId, question, courseContext } = req.body;
    
    if (!sessionId || !question) {
      return res.status(400).json({ error: 'sessionId and question required' });
    }

    // Get conversation history
    const history = await prisma.aiMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const response = await aiService.tutorResponse(question, courseContext, history.reverse());

    // Save question and response
    await prisma.aiMessage.create({
      data: { sessionId, role: 'user', content: question }
    });

    await prisma.aiMessage.create({
      data: { sessionId, role: 'assistant', content: response }
    });

    await prisma.session.update({
      where: { sessionId },
      data: { aiQueries: { increment: 1 } }
    });

    res.json({ response, generated_at: new Date() });
  } catch (err) {
    console.error('Tutor error:', err);
    res.status(500).json({ error: 'Failed to generate tutor response' });
  }
});

// ── GET /api/ai/admin-insights ────────────────────────────────────────
// Admin dashboard AI insights (requires admin token, can be added later)
router.get('/admin-insights', async (req, res) => {
  try {
    const stats = await Promise.all([
      prisma.session.count(),
      prisma.aiMessage.count({ where: { role: 'user' } }),
      prisma.course.count(),
      prisma.course.groupBy({ by: ['field'] }),
      prisma.paidUser.count(),
    ]);

    const [sessions, aiQueries, courses, fieldGroups, paidUsers] = stats;

    const insights = await aiService.generateAdminInsights({
      totalSessions: sessions,
      totalAiQueries: aiQueries,
      avgQueriesPerSession: sessions > 0 ? aiQueries / sessions : 0,
      activeCourses: courses,
      topFields: fieldGroups.map(f => f.field).join(', '),
      paidUsers
    });

    res.json({
      insights,
      stats: {
        sessions, aiQueries, courses, paidUsers,
        avgQueriesPerSession: sessions > 0 ? (aiQueries / sessions).toFixed(2) : 0
      },
      generated_at: new Date()
    });
  } catch (err) {
    console.error('Admin insights error:', err);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

module.exports = router;
