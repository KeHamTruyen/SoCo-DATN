import aiAssistantService from '../services/aiAssistant.service.js';

class AiAssistantController {
  async chat(req, res, next) {
    try {
      const message = typeof req.body?.message === 'string' ? req.body.message : '';
      const history = Array.isArray(req.body?.history) ? req.body.history : [];
      const memory = req.body?.memory && typeof req.body.memory === 'object' ? req.body.memory : {};

      const safeHistory = history
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          role: item.role === 'assistant' ? 'assistant' : 'user',
          content: String(item.content || '').slice(0, 2000),
        }))
        .filter((item) => item.content.trim().length > 0)
        .slice(-8);

      const response = await aiAssistantService.chat({
        userId: req.user.id,
        message,
        history: safeHistory,
        memory,
      });

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AiAssistantController();
