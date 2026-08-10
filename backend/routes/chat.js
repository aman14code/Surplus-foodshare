const express = require('express');
const router = express.Router();
const { chatWithBot } = require('../services/aiService');

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await chatWithBot(message, history || []);
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to chat with AI assistant' });
  }
});

module.exports = router;
