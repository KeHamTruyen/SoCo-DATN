import categoryService from '../services/category.service.js';

class CategoryController {
  /**
   * Get all categories
   * GET /api/categories
   */
  async getCategories(req, res, next) {
    try {
      const categories = await categoryService.getCategories();

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category by ID or slug
   * GET /api/categories/:id
   */
  async getCategory(req, res, next) {
    try {
      const category = await categoryService.getCategory(req.params.id);

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get root categories
   * GET /api/categories/root
   */
  async getRootCategories(req, res, next) {
    try {
      const categories = await categoryService.getRootCategories();

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
