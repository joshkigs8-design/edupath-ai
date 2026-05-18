// frontend/js/aiWidgets.js
// AI-Powered UI Components: Chat, Recommendations, Insights, Study Tools

class AIWidgets {
  constructor(apiBase = '/.netlify/functions/api') {
    this.apiBase = apiBase;
    this.sessionId = this.getOrCreateSessionId();
  }

  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('edupath_sessionId');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('edupath_sessionId', sessionId);
    }
    return sessionId;
  }

  async apiCall(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    try {
      const response = await fetch(this.apiBase + endpoint, options);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('API Call Error:', err);
      throw err;
    }
  }

  // ── AI CHAT WIDGET ──────────────────────────────────────────────────────
  createChatWidget(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="ai-chat-widget">
        <div class="chat-header">
          <span class="chat-icon">🤖</span>
          <span class="chat-title">EduPath AI Tutor</span>
          <button class="chat-close" onclick="this.parentElement.parentElement.style.display='none'">✕</button>
        </div>
        <div class="chat-messages" id="chatMessages"></div>
        <div class="chat-input-group">
          <input type="text" id="chatInput" placeholder="Ask your question..." class="chat-input">
          <button onclick="window.aiWidgets.sendMessage()" class="chat-send">Send</button>
        </div>
      </div>
    `;

    this.addChatStyles();
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input?.value.trim();
    if (!message) return;

    const messagesDiv = document.getElementById('chatMessages');
    
    // Show user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user-message';
    userMsg.textContent = message;
    messagesDiv?.appendChild(userMsg);
    input.value = '';

    try {
      const response = await this.apiCall('/students/ai-chat', 'POST', {
        sessionId: this.sessionId,
        question: message,
        messages: [{ role: 'user', content: message }]
      });

      // Show AI response
      const aiMsg = document.createElement('div');
      aiMsg.className = 'chat-message ai-message';
      aiMsg.textContent = response.response || response.reply || 'No response';
      messagesDiv?.appendChild(aiMsg);
      messagesDiv?.scrollTop = messagesDiv?.scrollHeight;
    } catch (err) {
      const errMsg = document.createElement('div');
      errMsg.className = 'chat-message error-message';
      errMsg.textContent = 'Error: ' + err.message;
      messagesDiv?.appendChild(errMsg);
    }
  }

  // ── COURSE RECOMMENDATIONS CARD ────────────────────────────────────────
  async createRecommendationsCard(containerId, studentData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="ai-card loading">Loading recommendations...</div>';

    try {
      const recommendations = await this.apiCall('/ai/recommendations', 'POST', {
        sessionId: this.studentId,
        grades: studentData.grades,
        interests: studentData.interests,
        currentCourses: studentData.currentCourses,
        careerGoal: studentData.careerGoal
      });

      let html = '<div class="ai-recommendations"><h3>🎯 Recommended Courses</h3>';
      
      if (recommendations.recommendations?.length > 0 || recommendations.recommendations?.raw) {
        const items = recommendations.recommendations.length > 0 
          ? recommendations.recommendations 
          : [{ reason: recommendations.recommendations.raw }];
        
        items.forEach((item, i) => {
          html += `
            <div class="rec-item">
              <div class="rec-number">${i + 1}</div>
              <div class="rec-content">
                <strong>${item.courseName || item.reason?.split('\n')[0] || 'Course'}</strong>
                <p>${item.reason || ''}</p>
              </div>
            </div>
          `;
        });
      }
      html += '</div>';
      container.innerHTML = html;
      this.addRecommendationStyles();
    } catch (err) {
      container.innerHTML = `<div class="ai-card error">Failed to load recommendations</div>`;
    }
  }

  // ── CAREER GUIDANCE PANEL ──────────────────────────────────────────────
  async createCareerGuidancePanel(containerId, studentData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="ai-card loading">Generating career guidance...</div>';

    try {
      const guidance = await this.apiCall('/ai/career-guidance', 'POST', {
        sessionId: this.sessionId,
        interests: studentData.interests,
        strengths: studentData.strengths,
        currentCourses: studentData.currentCourses,
        grades: studentData.grades,
        careerGoal: studentData.careerGoal
      });

      const html = `
        <div class="ai-career-panel">
          <h3>🚀 Your Career Path</h3>
          <div class="guidance-content">
            ${guidance.guidance || 'Loading...'}
          </div>
          <div class="guidance-actions">
            <button onclick="window.aiWidgets.exportGuidance()" class="btn-secondary">📥 Download</button>
            <button onclick="window.aiWidgets.saveGuidance()" class="btn-primary">💾 Save</button>
          </div>
        </div>
      `;
      container.innerHTML = html;
      this.addCareerStyles();
    } catch (err) {
      container.innerHTML = `<div class="ai-card error">Failed to load career guidance</div>`;
    }
  }

  // ── COURSE SUMMARY WIDGET ──────────────────────────────────────────────
  async createCourseSummary(containerId, courseId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="ai-card loading">Summarizing course...</div>';

    try {
      const summary = await this.apiCall('/ai/summarize-course', 'POST', {
        sessionId: this.sessionId,
        courseId: courseId
      });

      const html = `
        <div class="ai-summary">
          <h3>📚 ${summary.course}</h3>
          <div class="summary-content">${this.formatText(summary.summary)}</div>
        </div>
      `;
      container.innerHTML = html;
      this.addSummaryStyles();
    } catch (err) {
      container.innerHTML = `<div class="ai-card error">Failed to load summary</div>`;
    }
  }

  // ── STUDENT PROGRESS ANALYSIS ──────────────────────────────────────────
  async createProgressAnalysis(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="ai-card loading">Analyzing progress...</div>';

    try {
      const analysis = await this.apiCall('/ai/progress-analysis', 'POST', {
        sessionId: this.sessionId
      });

      const html = `
        <div class="ai-progress">
          <h3>📊 Your Progress Analysis</h3>
          <div class="analysis-header">
            <span class="student-name">${analysis.sessionInfo?.studentName || 'Student'}</span>
            <span class="queries-count">🤖 ${analysis.sessionInfo?.queries || 0} AI Queries</span>
          </div>
          <div class="analysis-content">${this.formatText(analysis.analysis)}</div>
        </div>
      `;
      container.innerHTML = html;
      this.addProgressStyles();
    } catch (err) {
      container.innerHTML = `<div class="ai-card error">Failed to load analysis</div>`;
    }
  }

  // ── PRACTICE QUESTIONS GENERATOR ───────────────────────────────────────
  async createPracticeQuestions(containerId, courseId, difficulty = 'medium') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="ai-card loading">Generating questions...</div>';

    try {
      const response = await this.apiCall('/ai/practice-questions', 'POST', {
        sessionId: this.sessionId,
        courseId: courseId,
        difficulty: difficulty
      });

      let html = `
        <div class="ai-practice">
          <h3>❓ Practice Questions - ${difficulty}</h3>
          <div class="difficulty-selector">
            <button class="diff-btn ${difficulty === 'easy' ? 'active' : ''}" onclick="window.aiWidgets.createPracticeQuestions('${containerId}', '${courseId}', 'easy')">Easy</button>
            <button class="diff-btn ${difficulty === 'medium' ? 'active' : ''}" onclick="window.aiWidgets.createPracticeQuestions('${containerId}', '${courseId}', 'medium')">Medium</button>
            <button class="diff-btn ${difficulty === 'hard' ? 'active' : ''}" onclick="window.aiWidgets.createPracticeQuestions('${containerId}', '${courseId}', 'hard')">Hard</button>
          </div>
          <div class="questions-list">
      `;

      const questions = response.questions?.length > 0 ? response.questions : 
                       (response.questions?.raw ? [{ question: response.questions.raw }] : []);

      questions.forEach((q, i) => {
        html += `
          <div class="question-card">
            <div class="question-num">Q${i + 1}</div>
            <div class="question-text">${q.question || q}</div>
            <button class="reveal-btn" onclick="this.nextElementSibling.style.display='block'; this.style.display='none'">Show Answer</button>
            <div class="answer-reveal" style="display:none;">
              <p><strong>Answer:</strong> ${q.correct || q.explanation || 'Check course materials'}</p>
            </div>
          </div>
        `;
      });

      html += '</div></div>';
      container.innerHTML = html;
      this.addPracticeStyles();
    } catch (err) {
      container.innerHTML = `<div class="ai-card error">Failed to load questions</div>`;
    }
  }

  // ── UTILITY METHODS ────────────────────────────────────────────────────
  formatText(text) {
    return (text || '').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  exportGuidance() {
    alert('Export feature coming soon');
  }

  saveGuidance() {
    alert('Save feature coming soon');
  }

  // ── STYLES ─────────────────────────────────────────────────────────────
  addChatStyles() {
    if (document.getElementById('aiWidgetStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'aiWidgetStyles';
    style.innerHTML = `
      .ai-chat-widget {
        border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        max-width: 400px; margin: 20px auto; background: white; overflow: hidden;
      }
      .chat-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;
      }
      .chat-messages {
        height: 300px; overflow-y: auto; padding: 15px; background: #f9f9f9;
      }
      .chat-message {
        margin: 10px 0; padding: 10px 15px; border-radius: 8px; max-width: 90%; word-wrap: break-word;
      }
      .user-message {
        background: #667eea; color: white; align-self: flex-end; margin-left: auto;
      }
      .ai-message {
        background: white; border: 1px solid #ddd; color: #333;
      }
      .error-message { background: #fee; color: #c33; }
      .chat-input-group {
        display: flex; padding: 10px; gap: 10px; border-top: 1px solid #ddd;
      }
      .chat-input {
        flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;
      }
      .chat-send {
        padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;
      }
      .chat-close { background: none; border: none; color: white; font-size: 18px; cursor: pointer; }

      .ai-card { padding: 20px; margin: 15px 0; border-radius: 8px; background: #f5f5f5; }
      .ai-card.loading { text-align: center; color: #999; }
      .ai-card.error { background: #fee; color: #c33; }

      .ai-recommendations, .ai-career-panel, .ai-summary, .ai-progress, .ai-practice {
        background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #eee;
      }
      .rec-item { display: flex; gap: 15px; margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
      .rec-number { min-width: 30px; height: 30px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
      .rec-content strong { display: block; margin-bottom: 5px; }

      .guidance-content { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; }
      .guidance-actions { display: flex; gap: 10px; margin-top: 15px; }
      .btn-primary { background: #667eea; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
      .btn-secondary { background: #f0f0f0; color: #333; padding: 10px 15px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; }

      .difficulty-selector { display: flex; gap: 10px; margin: 15px 0; }
      .diff-btn { padding: 8px 15px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; background: white; }
      .diff-btn.active { background: #667eea; color: white; }

      .questions-list { margin-top: 15px; }
      .question-card { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #667eea; }
      .question-num { display: inline-block; background: #667eea; color: white; padding: 5px 10px; border-radius: 3px; margin-bottom: 10px; }
      .question-text { margin: 10px 0; }
      .reveal-btn { padding: 8px 12px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; margin-top: 10px; }
      .answer-reveal { background: #e8f5e9; padding: 12px; border-radius: 4px; margin-top: 10px; }
    `;
    document.head.appendChild(style);
  }

  addRecommendationStyles() { this.addChatStyles(); }
  addCareerStyles() { this.addChatStyles(); }
  addSummaryStyles() { this.addChatStyles(); }
  addProgressStyles() { this.addChatStyles(); }
  addPracticeStyles() { this.addChatStyles(); }
}

// Initialize globally
window.aiWidgets = new AIWidgets();
