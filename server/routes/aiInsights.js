import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Gemini AI configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

// POST /api/ai/insights - Generate AI insights using Gemini
router.post('/insights', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!GEMINI_API_KEY) {
      console.error('[AI Insights] Gemini API key not configured');
      return res.status(500).json({ error: 'Gemini AI is not configured' });
    }

    console.log('[AI Insights] Generating insights with Gemini AI...');

    const url = `${GEMINI_API_ENDPOINT}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.92,
          maxOutputTokens: 2000,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Insights] Gemini API error:', errorText);
      return res.status(500).json({ error: `Gemini API error: ${response.status}` });
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('[AI Insights] Invalid Gemini response structure:', JSON.stringify(data, null, 2));
      return res.status(500).json({ error: 'Invalid response from Gemini AI' });
    }

    const content = data.candidates[0].content.parts[0].text;

    console.log('[AI Insights] Successfully generated insights');
    res.json({ content });

  } catch (error) {
    console.error('[AI Insights] Error:', error);
    res.status(500).json({ error: 'Failed to generate AI insights' });
  }
});

export default router;
