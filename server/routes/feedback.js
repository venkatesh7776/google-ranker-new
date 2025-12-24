import express from 'express';
import feedbackService from '../services/feedbackService.js';

const router = express.Router();

// ============================================
// Public Routes (No authentication required)
// ============================================

// Submit feedback (public endpoint for customers)
router.post('/submit', async (req, res) => {
  try {
    console.log('[Feedback API] ============================================');
    console.log('[Feedback API] Received feedback submission request');
    console.log('[Feedback API] Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      locationId,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      rating,
      feedbackText,
      feedbackCategory
    } = req.body;

    console.log(`[Feedback API] Submitting feedback for location ${locationId}, rating: ${rating}`);

    const feedback = await feedbackService.submitFeedback({
      locationId,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      rating,
      feedbackText,
      feedbackCategory
    });

    console.log('[Feedback API] ✅ Feedback submitted successfully:', feedback.id);
    console.log('[Feedback API] ============================================');

    res.json({
      success: true,
      feedback,
      message: 'Thank you for your feedback!'
    });
  } catch (error) {
    console.error('[Feedback API] Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit feedback'
    });
  }
});

// ============================================
// Protected Routes (Require authentication)
// ============================================

// Get feedback for a specific location
router.get('/location/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { userId, rating, isResolved, category, limit } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required'
      });
    }

    console.log(`[Feedback API] Fetching feedback for location ${locationId}, user ${userId}`);

    const filters = {};
    if (rating) filters.rating = parseInt(rating);
    if (isResolved !== undefined) filters.isResolved = isResolved === 'true';
    if (category) filters.category = category;
    if (limit) filters.limit = parseInt(limit);

    const feedback = await feedbackService.getFeedbackForLocation(
      locationId,
      userId,
      filters
    );

    const stats = await feedbackService.getFeedbackStats(locationId, userId);

    res.json({
      success: true,
      feedback,
      stats,
      count: feedback.length
    });
  } catch (error) {
    console.error('[Feedback API] Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback'
    });
  }
});

// Get all feedback for a user (across all locations)
router.get('/all', async (req, res) => {
  try {
    const { userId, rating, isResolved, limit } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required'
      });
    }

    console.log(`[Feedback API] Fetching all feedback for user ${userId}`);

    const filters = {};
    if (rating) filters.rating = parseInt(rating);
    if (isResolved !== undefined) filters.isResolved = isResolved === 'true';
    if (limit) filters.limit = parseInt(limit);

    const feedback = await feedbackService.getAllFeedbackForUser(userId, filters);

    res.json({
      success: true,
      feedback,
      count: feedback.length
    });
  } catch (error) {
    console.error('[Feedback API] Error fetching all feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback'
    });
  }
});

// Get feedback statistics for a location
router.get('/stats/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required'
      });
    }

    console.log(`[Feedback API] Fetching stats for location ${locationId}`);

    const stats = await feedbackService.getFeedbackStats(locationId, userId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('[Feedback API] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// Resolve feedback
router.patch('/:feedbackId/resolve', async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { userId, resolutionNotes } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    console.log(`[Feedback API] Resolving feedback ${feedbackId}`);

    const feedback = await feedbackService.resolveFeedback(
      feedbackId,
      userId,
      resolutionNotes
    );

    res.json({
      success: true,
      feedback,
      message: 'Feedback marked as resolved'
    });
  } catch (error) {
    console.error('[Feedback API] Error resolving feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve feedback'
    });
  }
});

// Delete feedback
router.delete('/:feedbackId', async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required'
      });
    }

    console.log(`[Feedback API] Deleting feedback ${feedbackId}`);

    await feedbackService.deleteFeedback(feedbackId, userId);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('[Feedback API] Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete feedback'
    });
  }
});

export default router;
