const router = require('express').Router();
const authMW = require('../middleware/auth');

router.use(authMW);

router.post('/ai', async (req, res) => {
  try {
    const { stats, moodStr } = req.body;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages:   [{
          role:    'user',
          content: `You are an ADHD-friendly habit coach. Write a short encouraging report (3 paragraphs, no bullets, use emojis) based on:\n\n${stats}\n\n${moodStr}`
        }]
      })
    });
    const data   = await response.json();
    const report = (data.content || []).map(c => c.text || '').join('');
    res.json({ report });
  } catch(e) { res.status(500).json({ message: 'AI report failed', report: '' }); }
});

module.exports = router;