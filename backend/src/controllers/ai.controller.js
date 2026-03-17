import * as aiService from '../services/ai.service.js';

export const generatePostText = async (req, res) => {
  try {
    const result = await aiService.generatePostText(req.user.id, req.body);

    return res.json({
      success: true,
      message: 'AI text generated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Generate post text error:', error);

    if (error.message === 'GEMINI_API_KEY is not configured') {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is missing on server',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI text',
      error: error.message,
    });
  }
};

export const buyerAssistantChat = async (req, res, next) => {
  try {
    const data = await aiService.buyerAssistantChat(req.user.id, req.body || {});

    return res.status(200).json({
      success: true,
      message: 'Buyer assistant response generated successfully',
      data,
    });
  } catch (error) {
    return next(error);
  }
};
