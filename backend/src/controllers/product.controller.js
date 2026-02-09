import productService from '../services/product.service.js';

class ProductController {
  /**
   * Create new product
   * POST /api/products
   */
  async createProduct(req, res, next) {
    try {
      const sellerId = req.user.id;
      const product = await productService.createProduct(sellerId, req.body);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all products with filters
   * GET /api/products
   */
  async getProducts(req, res, next) {
    try {
      const result = await productService.getProducts(req.query);

      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single product by ID or slug
   * GET /api/products/:id
   */
  async getProduct(req, res, next) {
    try {
      const product = await productService.getProduct(req.params.id);

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product
   * PUT /api/products/:id
   */
  async updateProduct(req, res, next) {
    try {
      const sellerId = req.user.id;
      const product = await productService.updateProduct(
        req.params.id,
        sellerId,
        req.body
      );

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product
   * DELETE /api/products/:id
   */
  async deleteProduct(req, res, next) {
    try {
      const sellerId = req.user.id;
      await productService.deleteProduct(req.params.id, sellerId);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publish product
   * POST /api/products/:id/publish
   */
  async publishProduct(req, res, next) {
    try {
      const sellerId = req.user.id;
      const product = await productService.publishProduct(req.params.id, sellerId);

      res.json({
        success: true,
        message: 'Product published successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add product images
   * POST /api/products/:id/images
   */
  async addProductImages(req, res, next) {
    try {
      const sellerId = req.user.id;
      const { images } = req.body;

      const createdImages = await productService.addProductImages(
        req.params.id,
        sellerId,
        images
      );

      res.json({
        success: true,
        message: 'Images added successfully',
        data: createdImages
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product image
   * DELETE /api/products/:id/images/:imageId
   */
  async deleteProductImage(req, res, next) {
    try {
      const sellerId = req.user.id;
      await productService.deleteProductImage(
        req.params.id,
        req.params.imageId,
        sellerId
      );

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get seller's products
   * GET /api/products/seller/me
   */
  async getMyProducts(req, res, next) {
    try {
      const sellerId = req.user.id;
      const result = await productService.getSellerProducts(sellerId, req.query);

      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
