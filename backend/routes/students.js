const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/session', async function(req, res) {
  try {
    var b = req.body;
    var sid = b.sessionId;
    if (sid) {
      var session = await prisma.session.upsert({
        where:  { sessionId: sid },
        update: {
          ...(b.firstName   && { firstName: b.firstName }),
          ...(b.email       && { email: b.email.toLowerCase().trim() }),
          ...(b.gradesJson  && { gradesJson: b.gradesJson }),
          ...(b.resultsJson && { resultsJson: b.resultsJson }),
          lastSeen: new Date(),
        },
        create: { sessionId: sid, firstName: b.firstName||null, email: b.email||null, gradesJson: b.gradesJson||null, resultsJson: b.resultsJson||null },
      });
      return res.json({ session: { sessionId: session.sessionId } });
    }
    var session = await prisma.session.create({ data: { firstName: b.firstName||null, email: b.email||null, gradesJson: b.gradesJson||null, resultsJson: b.resultsJson||null } });
    res.status(201).json({ session: { sessionId: session.sessionId } });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

router.post('/ai-query', async function(req, res) {
  try {
    var b = req.body;
    if (!b.sessionId || !b.role || !b.content) return res.status(400).json({ error: 'sessionId, role and content required' });
    await prisma.aiMessage.create({ data: { sessionId: b.sessionId, role: b.role, content: b.content } });
    await prisma.session.updateMany({ where: { sessionId: b.sessionId }, data: { aiQueries: { increment: 1 } } });
    res.json({ logged: true });
  } catch(err) {
    res.status(500).json({ error: 'Failed to log AI query' });
  }
});

router.post('/ai-chat', async function(req, res) {
  try {
    const b = req.body;
    if (!b.messages || !Array.isArray(b.messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }
    
    const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
    if (!NVIDIA_API_KEY) {
      return res.status(500).json({ error: 'NVIDIA API key not configured' });
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + NVIDIA_API_KEY
    };

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        max_tokens: b.max_tokens || 1024,
        temperature: b.temperature || 0.7,
        messages: b.messages
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'NVIDIA API error: ' + errorText });
    }
    
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';
    
    if (b.sessionId && reply) {
      await prisma.aiMessage.create({ data: { sessionId: b.sessionId, role: 'assistant', content: reply } });
      await prisma.session.updateMany({ where: { sessionId: b.sessionId }, data: { aiQueries: { increment: 1 } } });
    }
    
    res.json({ reply });
  } catch(err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'AI chat failed' });
  }
});

module.exports = router;
