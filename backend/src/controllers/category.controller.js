import categoryService from '../services/category.service.js';

class CategoryController {
  /**
   * Get all categories
   * GET /api/categories
   */
  async getCategories(req, res, next) {
    try {
      const onlyWithPublishedProducts =
        req.query.onlyWithPublishedProducts === 'true' ||
        req.query.onlyWithPublishedProducts === '1';
      const categories = await categoryService.getCategories({ onlyWithPublishedProducts });

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

  /**
   * Admin: list all categories (query includeInactive=true)
   * GET /api/admin/categories
   */
  async adminListCategories(req, res, next) {
    try {
      const includeInactive =
        req.query.includeInactive === 'true' || req.query.includeInactive === '1';
      const categories = await categoryService.listCategoriesAdmin({ includeInactive });

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: get category by id
   * GET /api/admin/categories/:id
   */
  async adminGetCategory(req, res, next) {
    try {
      const category = await categoryService.getCategoryByIdAdmin(req.params.id);

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      if (error.message === 'Category not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  /**
   * Admin: create category
   * POST /api/admin/categories
   */
  async adminCreateCategory(req, res, next) {
    try {
      const category = await categoryService.createCategoryAdmin(req.body);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: update category
   * PUT /api/admin/categories/:id
   */
  async adminUpdateCategory(req, res, next) {
    try {
      const category = await categoryService.updateCategoryAdmin(req.params.id, req.body);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      if (error.message === 'Category not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (
        error.message?.includes('Slug already') ||
        error.message?.includes('Invalid parent') ||
        error.message?.includes('own parent')
      ) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  /**
   * Admin: deactivate category (soft)
   * DELETE /api/admin/categories/:id
   */
  async adminDeactivateCategory(req, res, next) {
    try {
      await categoryService.deactivateCategoryAdmin(req.params.id);

      res.json({
        success: true,
        message: 'Category deactivated successfully'
      });
    } catch (error) {
      if (error.message === 'Category not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}

export default new CategoryController();
