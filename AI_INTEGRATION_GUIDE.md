# 🤖 EduPath AI Integration Guide

## Overview
Your website now has complete AI integration powered by NVIDIA's Llama 3.1 model. All AI features are available through a centralized API and can be easily added to any page.

---

## 🚀 Quick Start

### 1. **Backend Setup** ✅
- **AI Service Module**: `backend/services/aiService.js`
  - Centralized AI logic for all features
  - Handles all NVIDIA API calls
  - Provides 6 main AI features
  
- **AI Routes**: `backend/routes/ai.js`
  - 7 new API endpoints
  - Available at `/api/ai/`
  
- **Server Registration**: `backend/server.js`
  - Routes registered and ready to use

### 2. **Frontend Setup** ✅
- **AI Widgets Library**: `frontend/js/aiWidgets.js`
  - Plug-and-play UI components
  - Automatic session management
  - Responsive design included

- **Demo Page**: `frontend/ai-features.html`
  - Complete showcase of all features
  - Interactive examples
  - Copy-paste ready code

---

## 📋 Available Features

### 1. **AI Study Tutor** 💬
**Purpose**: Answer student questions with context-aware assistance

**API Endpoint**:
```
POST /api/ai/tutor
```

**Request Body**:
```json
{
  "sessionId": "sess_xxx",
  "question": "Explain photosynthesis",
  "courseContext": "Biology 101"
}
```

**Response**:
```json
{
  "response": "Photosynthesis is the process...",
  "generated_at": "2024-05-18T10:30:00Z"
}
```

**Usage Example**:
```javascript
// Initialize if not already done
window.aiWidgets.createChatWidget('chatContainer');

// Or use raw API call
const response = await fetch('/api/ai/tutor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'sess_123',
    question: 'What is photosynthesis?',
    courseContext: 'Biology'
  })
});
const data = await response.json();
console.log(data.response);
```

---

### 2. **Smart Course Recommendations** 🎯
**Purpose**: AI-powered personalized course suggestions

**API Endpoint**:
```
POST /api/ai/recommendations
```

**Request Body**:
```json
{
  "sessionId": "sess_xxx",
  "grades": "85,90,78",
  "interests": "Technology, Data",
  "currentCourses": "CS101, MATH201",
  "careerGoal": "Data Scientist"
}
```

**Response**:
```json
{
  "recommendations": [
    {
      "courseCode": "CS201",
      "courseName": "Data Structures",
      "university": "University A",
      "reason": "..."
    }
  ]
}
```

**Usage Example**:
```javascript
// Using AI Widgets
await window.aiWidgets.createRecommendationsCard('containerID', {
  grades: "75,82,88",
  interests: "Technology",
  currentCourses: "None",
  careerGoal: "Engineer"
});

// Or raw API
const recs = await fetch('/api/ai/recommendations', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: sessionId,
    grades: "75,82,88",
    interests: "Technology",
    careerGoal: "Engineer"
  })
});
```

---

### 3. **Career Path Guidance** 🚀
**Purpose**: Personalized career planning and skill development

**API Endpoint**:
```
POST /api/ai/career-guidance
```

**Request Body**:
```json
{
  "sessionId": "sess_xxx",
  "interests": "Technology, Innovation",
  "strengths": "Problem-solving",
  "currentCourses": "CS101",
  "grades": "Good",
  "careerGoal": "Software Engineer"
}
```

**Usage Example**:
```javascript
await window.aiWidgets.createCareerGuidancePanel('containerID', {
  interests: "Technology",
  strengths: "Leadership",
  currentCourses: "CS101",
  grades: "90",
  careerGoal: "Tech Lead"
});
```

---

### 4. **Student Progress Analysis** 📊
**Purpose**: AI insights on learning journey and engagement

**API Endpoint**:
```
POST /api/ai/progress-analysis
```

**Request Body**:
```json
{
  "sessionId": "sess_xxx"
}
```

**Response**:
```json
{
  "analysis": "Based on your 25 AI queries...",
  "sessionInfo": {
    "studentName": "John",
    "queries": 25
  }
}
```

**Usage Example**:
```javascript
await window.aiWidgets.createProgressAnalysis('containerID');
```

---

### 5. **Course Summarization** 📚
**Purpose**: Quick AI summaries of course content

**API Endpoint**:
```
POST /api/ai/summarize-course
```

**Request Body**:
```json
{
  "sessionId": "sess_xxx",
  "courseId": "123"
}
```

**Usage Example**:
```javascript
await window.aiWidgets.createCourseSummary('containerID', courseId);
```

---

### 6. **Practice Questions Generator** ❓
**Purpose**: AI-generated questions at multiple difficulties

**API Endpoint**:
```
POST /api/ai/practice-questions
```

**Request Body**:
```json
{
  "sessionId": "sess_xxx",
  "courseId": "123",
  "difficulty": "medium"
}
```

**Usage Example**:
```javascript
await window.aiWidgets.createPracticeQuestions('containerID', courseId, 'hard');
```

---

### 7. **Admin Insights** 🎛️
**Purpose**: AI-powered platform analytics (Admin only)

**API Endpoint**:
```
GET /api/ai/admin-insights
```

**Response**:
```json
{
  "insights": "Your platform is experiencing high engagement...",
  "stats": {
    "sessions": 1500,
    "aiQueries": 3200,
    "courses": 450,
    "paidUsers": 320,
    "avgQueriesPerSession": 2.13
  }
}
```

---

## 🔧 Integration Examples

### Example 1: Add AI Chat to Main Page
```html
<!-- In your index.html -->
<div id="aiChatContainer"></div>

<script src="/js/aiWidgets.js"></script>
<script>
  // Initialize chat widget
  document.addEventListener('DOMContentLoaded', () => {
    window.aiWidgets.createChatWidget('aiChatContainer');
  });
</script>
```

### Example 2: Add Recommendations to Courses Page
```html
<!-- In your courses.html -->
<div id="recommendationsContainer"></div>

<script src="/js/aiWidgets.js"></script>
<script>
  async function showRecommendations() {
    await window.aiWidgets.createRecommendationsCard('recommendationsContainer', {
      grades: getUserGrades(),
      interests: getUserInterests(),
      currentCourses: getCurrentCourses(),
      careerGoal: getUserCareerGoal()
    });
  }
</script>
```

### Example 3: Add Progress Widget to Dashboard
```html
<!-- In your dashboard.html -->
<div id="progressContainer"></div>

<script src="/js/aiWidgets.js"></script>
<script>
  // Load on dashboard view
  window.aiWidgets.createProgressAnalysis('progressContainer');
</script>
```

### Example 4: Add Career Guidance to Profile
```html
<!-- In user profile -->
<div id="careerContainer"></div>

<script src="/js/aiWidgets.js"></script>
<script>
  window.aiWidgets.createCareerGuidancePanel('careerContainer', {
    interests: userProfile.interests,
    strengths: userProfile.strengths,
    currentCourses: userProfile.courses,
    grades: userProfile.grades,
    careerGoal: userProfile.careerGoal
  });
</script>
```

---

## 🎯 Step-by-Step Integration

### Step 1: Add AI Widget Library to Page
```html
<!-- Include at the bottom of your HTML -->
<script src="/js/aiWidgets.js"></script>
```

### Step 2: Create Container for Widget
```html
<div id="myAIWidget"></div>
```

### Step 3: Initialize Widget
```javascript
// For chat
window.aiWidgets.createChatWidget('myAIWidget');

// For recommendations
await window.aiWidgets.createRecommendationsCard('myAIWidget', studentData);

// For career guidance
await window.aiWidgets.createCareerGuidancePanel('myAIWidget', studentData);

// For progress analysis
await window.aiWidgets.createProgressAnalysis('myAIWidget');

// For course summary
await window.aiWidgets.createCourseSummary('myAIWidget', courseId);

// For practice questions
await window.aiWidgets.createPracticeQuestions('myAIWidget', courseId, 'medium');
```

---

## 🛠️ Configuration

### API Base URL
The widgets automatically detect the API base URL:
- **Local development**: `http://localhost:3001/api`
- **Production**: `/.netlify/functions/api`

To override:
```javascript
window.aiWidgets = new AIWidgets('https://your-api-url');
```

### Session Management
Session IDs are automatically managed:
- Created on first access
- Stored in `sessionStorage`
- Used for all API calls
- Retrieved via: `sessionStorage.getItem('edupath_sessionId')`

---

## 🔐 Security & Best Practices

### 1. **Environment Variables**
Ensure these are set in your backend:
```
NVIDIA_API_KEY=your_nvidia_key
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

### 2. **Rate Limiting**
- Built-in rate limiting on backend
- 500 requests per 15 minutes per IP
- 20 payment requests per 15 minutes

### 3. **Error Handling**
Always handle errors:
```javascript
try {
  await window.aiWidgets.createRecommendationsCard('container', data);
} catch (err) {
  console.error('Failed to load recommendations:', err);
  // Show user-friendly error message
}
```

---

## 📱 Responsive Design
All widgets are fully responsive and work on:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

---

## 🎨 Customization

### Modify Widget Styles
Edit `aiWidgets.js` to customize colors:
```javascript
const style = document.createElement('style');
style.innerHTML = `
  .ai-chat-widget {
    border: 1px solid #your-color;
    background: #your-bg-color;
  }
  // ... more custom CSS
`;
```

### Add Custom API Handlers
Extend the AIWidgets class:
```javascript
class MyCustomAIWidgets extends AIWidgets {
  async customFeature(data) {
    return await this.apiCall('/ai/custom', 'POST', data);
  }
}
```

---

## 📊 Monitoring & Analytics

### Track AI Usage
All AI queries are logged:
- Stored in `aiMessage` table
- Tracked per `sessionId`
- Viewable in admin dashboard

### View Statistics
```javascript
const data = await fetch('/api/ai/admin-insights').then(r => r.json());
console.log(data.stats); // Sessions, queries, courses, etc.
```

---

## 🧪 Testing

### Test AI Endpoints Locally
```bash
# Test recommendations endpoint
curl -X POST http://localhost:3001/api/ai/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "grades": "85,90",
    "interests": "Tech",
    "careerGoal": "Engineer"
  }'

# Test career guidance
curl -X POST http://localhost:3001/api/ai/career-guidance \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "interests": "Technology",
    "strengths": "Problem-solving"
  }'
```

---

## 🐛 Troubleshooting

### Issue: "NVIDIA API key not configured"
**Solution**: Set `NVIDIA_API_KEY` environment variable

### Issue: Widgets not loading
**Solution**: Ensure `/js/aiWidgets.js` is accessible and loaded

### Issue: Session not persisting
**Solution**: Check if `sessionStorage` is enabled in browser

### Issue: API 404 errors
**Solution**: Verify backend routes are registered in `server.js`

---

## 📚 File Structure
```
backend/
├── services/
│   └── aiService.js          ← Core AI logic
├── routes/
│   └── ai.js                 ← AI API endpoints
└── server.js                 ← Routes registration

frontend/
├── js/
│   └── aiWidgets.js          ← UI components library
├── ai-features.html          ← Demo page
└── index.html                ← Main page (integrate widgets here)
```

---

## 🎓 Learn More
- **NVIDIA Llama 3.1**: https://www.nvidia.com/en-us/ai/llama
- **Prisma ORM**: https://www.prisma.io/docs
- **Supabase**: https://supabase.com/docs

---

## ✅ Checklist

- [x] Backend AI service created
- [x] API endpoints registered
- [x] Frontend widgets library created
- [x] Demo page (`ai-features.html`) created
- [x] Admin insights integrated
- [x] Database schema ready
- [ ] **Your turn**: Add widgets to main pages
- [ ] Test all features
- [ ] Deploy to production

---

## 🎉 Next Steps

1. **Test the demo page**: Navigate to `/ai-features.html`
2. **Add widgets to your pages**: Follow integration examples above
3. **Customize styling**: Modify CSS in widgets as needed
4. **Monitor usage**: Check admin panel for AI insights
5. **Collect feedback**: Iterate based on user experience

---

**Created**: May 18, 2024
**Status**: ✅ Production Ready
**Support**: All AI features powered by NVIDIA Llama 3.1
