import productService from '../services/product.service.js';
import {
  buildCacheKey,
  CACHE_TTL_SECONDS,
  cacheDelByPattern,
  getOrSetCache,
} from '../lib/cache.js';

async function invalidateProductCaches(identifier = null) {
  await Promise.all([
    cacheDelByPattern('soco:products:list:*'),
    cacheDelByPattern('soco:search:all:*'),
    ...(identifier ? [cacheDelByPattern(`soco:products:detail:${identifier}:*`)] : []),
  ]);
}

class ProductController {
  /**
   * Create new product
   * POST /api/products
   */
  async createProduct(req, res, next) {
    try {
      const sellerId = req.user.id;
      const product = await productService.createProduct(sellerId, req.body);
      await invalidateProductCaches(product.id);

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
      const key = buildCacheKey('products', 'list', req.query);
      const { data: result } = await getOrSetCache(key, CACHE_TTL_SECONDS.productsList, async () =>
        productService.getProducts(req.query),
      );

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
      const key = buildCacheKey('products', `detail:${req.params.id}`, req.query);
      const { data: product } = await getOrSetCache(key, CACHE_TTL_SECONDS.productDetail, async () =>
        productService.getProduct(req.params.id),
      );

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  async trackProductView(req, res, next) {
    try {
      await productService.trackProductView(req.params.id, req.user.id, req.body || {});
      res.status(201).json({
        success: true,
        message: 'Product view tracked'
      });
    } catch (error) {
      next(error);
    }
  }

  async trackSearchEvent(req, res, next) {
    try {
      await productService.trackSearchEvent(req.user.id, req.body || {});
      res.status(201).json({
        success: true,
        message: 'Search event tracked'
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyRecommendations(req, res, next) {
    try {
      const data = await productService.getPersonalizedRecommendations(req.user.id, req.query);
      res.json({
        success: true,
        data,
        pagination: data.pagination
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
      await invalidateProductCaches(req.params.id);

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
      const reason =
        req.body && typeof req.body.reason === 'string' ? req.body.reason : undefined;
      await productService.deleteProduct(req.params.id, sellerId, reason);
      await invalidateProductCaches(req.params.id);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreProduct(req, res, next) {
    try {
      const sellerId = req.user.id;
      const product = await productService.restoreProduct(req.params.id, sellerId);
      await invalidateProductCaches(req.params.id);
      res.json({
        success: true,
        message: 'Product restored successfully',
        data: product
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
      await invalidateProductCaches(req.params.id);

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
      await invalidateProductCaches(req.params.id);

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
      await invalidateProductCaches(req.params.id);

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get one product for current seller (no view increment)
   * GET /api/products/seller/me/:productId
   */
  async getMyProduct(req, res, next) {
    try {
      const sellerId = req.user.id;
      const product = await productService.getSellerProductById(
        sellerId,
        req.params.productId
      );

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
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

  /**
   * GET /api/products/seller/me/:productId/variants
   */
  async listMyProductVariants(req, res, next) {
    try {
      const sellerId = req.user.id;
      const variants = await productService.listSellerProductVariants(
        sellerId,
        req.params.productId,
      );

      res.json({
        success: true,
        data: variants,
      });
    } catch (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  /**
   * POST /api/products/seller/me/:productId/variants
   */
  async createMyProductVariant(req, res, next) {
    try {
      const sellerId = req.user.id;
      const variant = await productService.createSellerProductVariant(
        sellerId,
        req.params.productId,
        req.body,
      );
      await invalidateProductCaches(req.params.productId);

      res.status(201).json({
        success: true,
        message: 'Variant created successfully',
        data: variant,
      });
    } catch (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  /**
   * PUT /api/products/seller/me/:productId/variants/:variantId
   */
  async updateMyProductVariant(req, res, next) {
    try {
      const sellerId = req.user.id;
      const variant = await productService.updateSellerProductVariant(
        sellerId,
        req.params.productId,
        req.params.variantId,
        req.body,
      );
      await invalidateProductCaches(req.params.productId);

      res.json({
        success: true,
        message: 'Variant updated successfully',
        data: variant,
      });
    } catch (error) {
      if (error.message === 'Product not found' || error.message === 'Variant not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message?.includes('Unauthorized')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  /**
   * DELETE /api/products/seller/me/:productId/variants/:variantId
   */
  async deleteMyProductVariant(req, res, next) {
    try {
      const sellerId = req.user.id;
      const result = await productService.deleteSellerProductVariant(
        sellerId,
        req.params.productId,
        req.params.variantId,
      );
      await invalidateProductCaches(req.params.productId);

      res.json({
        success: true,
        message: 'Variant removed successfully',
        data: result,
      });
    } catch (error) {
      if (error.message === 'Product not found' || error.message === 'Variant not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message?.includes('Unauthorized')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}

export default new ProductController();
