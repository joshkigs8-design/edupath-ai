// backend/services/aiService.js
// Centralized AI Service for EduPath
// Handles all AI interactions: recommendations, summarization, career guidance, analysis

const fetch = require('node-fetch');

class AIService {
  constructor() {
    this.apiKey = process.env.NVIDIA_API_KEY;
    this.apiUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
    this.model = 'meta/llama-3.1-70b-instruct';
    this.maxTokens = 2048;
    this.temperature = 0.7;
  }

  // ── Core API Call ────────────────────────────────────────────────────────
  async callAI(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('NVIDIA API key not configured');
    }

    const payload = {
      model: this.model,
      messages: messages,
      max_tokens: options.maxTokens || this.maxTokens,
      temperature: options.temperature !== undefined ? options.temperature : this.temperature,
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('AI Service Error:', error.message);
      throw error;
    }
  }

  // ── COURSE RECOMMENDATIONS ───────────────────────────────────────────────
  async getRecommendations(studentProfile) {
    const { grades, interests, currentCourses, careerGoal, availableCourses } = studentProfile;

    const courseList = availableCourses
      .slice(0, 20)
      .map(c => `${c.name} (${c.code}) - ${c.uni}, Field: ${c.field}, Demand: ${c.demand}`)
      .join('\n');

    const prompt = `You are an educational advisor for EduPath. Based on a student's profile, recommend the best courses from the available list.

STUDENT PROFILE:
- Grades: ${grades || 'Not provided'}
- Interests: ${interests || 'Not specified'}
- Currently Taking: ${currentCourses || 'None'}
- Career Goal: ${careerGoal || 'Not specified'}

AVAILABLE COURSES:
${courseList}

Provide 3-5 course recommendations with brief explanations (2-3 sentences each). Format as JSON array with objects containing: { courseCode, courseName, university, reason }`;

    const messages = [{ role: 'user', content: prompt }];
    const response = await this.callAI(messages, { maxTokens: 1500, temperature: 0.5 });
    
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: response };
    } catch {
      return { raw: response };
    }
  }

  // ── COURSE CONTENT SUMMARIZATION ────────────────────────────────────────
  async summarizeCourse(courseData) {
    const { name, code, description, uni, field, demand } = courseData;

    const prompt = `Summarize this university course for a student considering taking it:

COURSE: ${name} (${code})
UNIVERSITY: ${uni}
FIELD: ${field}
DEMAND: ${demand}
DESCRIPTION: ${description || 'No description available'}

Provide a concise 2-3 paragraph summary covering:
1. What the course is about
2. Who should take it
3. Key topics/skills covered
4. Career relevance

Keep it clear and encouraging for students.`;

    const messages = [{ role: 'user', content: prompt }];
    return await this.callAI(messages, { maxTokens: 1000, temperature: 0.6 });
  }

  // ── CAREER PATH GUIDANCE ────────────────────────────────────────────────
  async getCareerGuidance(studentProfile) {
    const { interests, strengths, currentCourses, grades, careerGoal } = studentProfile;

    const prompt = `You are a career counselor helping a student at EduPath plan their educational and career path.

STUDENT PROFILE:
- Interests: ${interests || 'Not specified'}
- Strengths: ${strengths || 'Not specified'}
- Current Courses: ${currentCourses || 'None'}
- Academic Performance: ${grades || 'Not provided'}
- Desired Career: ${careerGoal || 'Not specified'}

Based on this profile, provide:
1. 2-3 relevant career paths they should consider
2. Key skills to develop
3. Recommended course areas to focus on
4. Action steps for next 6-12 months
5. Resources or opportunities to explore

Be encouraging and practical.`;

    const messages = [{ role: 'user', content: prompt }];
    return await this.callAI(messages, { maxTokens: 1500, temperature: 0.7 });
  }

  // ── STUDENT PROGRESS ANALYSIS ──────────────────────────────────────────
  async analyzeStudentProgress(sessionData, allMessages) {
    const { firstName, email, gradesJson, resultsJson, aiQueries } = sessionData;
    const conversationContext = allMessages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');

    const prompt = `Analyze this student's progress at EduPath and provide personalized insights.

STUDENT: ${firstName || 'Anonymous'} (${email || 'No email'})
AI CONVERSATIONS: ${aiQueries} queries so far
GRADES: ${gradesJson || 'Not provided'}
RESULTS: ${resultsJson || 'Not provided'}

RECENT CONVERSATION CONTEXT:
${conversationContext}

Provide a brief analysis including:
1. Current engagement level (based on AI queries and activity)
2. Learning patterns observed
3. Suggested areas to improve
4. Personalized next steps
5. Motivational message

Keep it concise (150-200 words) and actionable.`;

    const messages = [{ role: 'user', content: prompt }];
    return await this.callAI(messages, { maxTokens: 800, temperature: 0.6 });
  }

  // ── AI STUDY TUTOR ─────────────────────────────────────────────────────
  async tutorResponse(studentQuestion, courseContext, conversationHistory) {
    const systemPrompt = `You are an expert study tutor for EduPath. Help students understand concepts clearly.
COURSE CONTEXT: ${courseContext || 'General education'}
- Explain concepts step-by-step
- Use examples from real life
- Encourage critical thinking
- Be supportive and positive`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: studentQuestion }
    ];

    return await this.callAI(messages, { maxTokens: 1200, temperature: 0.7 });
  }

  // ── ADMIN DASHBOARD INSIGHTS ──────────────────────────────────────────
  async generateAdminInsights(stats) {
    const { totalSessions, totalAiQueries, avgQueriesPerSession, activeCourses, topFields, paidUsers } = stats;

    const prompt = `Generate brief insights for an admin dashboard from these EduPath statistics:

STATISTICS:
- Total Sessions: ${totalSessions}
- Total AI Queries: ${totalAiQueries}
- Avg Queries/Session: ${avgQueriesPerSession?.toFixed(2) || 'N/A'}
- Active Courses: ${activeCourses}
- Top Fields: ${topFields || 'Varied'}
- Paid Users: ${paidUsers}

Provide 3-4 bullet-point insights covering:
- User engagement trends
- Most popular course fields
- Recommendations to increase paid conversions
- Suggested feature improvements

Keep each insight 1-2 sentences, actionable, and data-driven.`;

    const messages = [{ role: 'user', content: prompt }];
    return await this.callAI(messages, { maxTokens: 600, temperature: 0.5 });
  }

  // ── PRACTICE QUESTION GENERATOR ─────────────────────────────────────────
  async generatePracticeQuestions(courseData, difficulty = 'medium') {
    const { name, field, code } = courseData;

    const prompt = `Generate 3-5 practice questions for a student studying this course:

COURSE: ${name} (${code})
FIELD: ${field}
DIFFICULTY: ${difficulty}

Format as JSON array with objects containing:
{ question: "...", options: [...], correct: index, explanation: "..." }

Make questions practical and relevant to the field.`;

    const messages = [{ role: 'user', content: prompt }];
    const response = await this.callAI(messages, { maxTokens: 1200, temperature: 0.6 });
    
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: response };
    } catch {
      return { raw: response };
    }
  }
}

module.exports = new AIService();
