import prisma from '../config/database.js';
import slugify from 'slugify';

class ProductService {
  /**
   * Create a new product
   */
  async createProduct(sellerId, data) {
    const { title, description, price, categoryId, images, variants, ...rest } = data;

    // Generate unique slug
    let slug = slugify(title, { lower: true, strict: true });
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create product with images and variants
    const product = await prisma.product.create({
      data: {
        sellerId,
        title,
        slug,
        description,
        price,
        categoryId,
        status: 'DRAFT',
        ...rest,
        images: images && images.length > 0 ? {
          create: images.map((img, index) => ({
            imageUrl: img.url,
            altText: img.altText || title,
            displayOrder: index,
            isPrimary: index === 0
          }))
        } : undefined,
        variants: variants && variants.length > 0 ? {
          create: variants.map(variant => ({
            variantName: variant.name,
            sku: variant.sku,
            price: variant.price,
            stockQuantity: variant.stockQuantity || 0,
            options: variant.options || {}
          }))
        } : undefined
      },
      include: {
        images: true,
        variants: true,
        category: true,
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true
          }
        }
      }
    });

    return product;
  }

  /**
   * Get all products with filters and pagination
   */
  async getProducts(filters = {}) {
    const {
      page = 1,
      limit = 20,
      categoryId,
      sellerId,
      status,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      ...(categoryId && { categoryId }),
      ...(sellerId && { sellerId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) })
        }
      }
    };

    // Get products and total count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          images: {
            orderBy: { displayOrder: 'asc' }
          },
          category: true,
          seller: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true
            }
          },
          _count: {
            select: { reviews: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single product by ID or slug
   */
  async getProduct(identifier) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier }
        ]
      },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }
        },
        variants: {
          where: { isActive: true }
        },
        category: true,
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            bio: true,
            isVerified: true
          }
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                username: true,
                fullName: true,
                avatarUrl: true
              }
            }
          }
        },
        _count: {
          select: { reviews: true }
        }
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { viewsCount: { increment: 1 } }
    });

    return product;
  }

  /**
   * Update product
   */
  async updateProduct(productId, sellerId, data) {
    // Verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new Error('Unauthorized to update this product');
    }

    const { images, variants, ...updateData } = data;

    // Update slug if title changed
    if (updateData.title && updateData.title !== product.title) {
      let slug = slugify(updateData.title, { lower: true, strict: true });
      const existingSlug = await prisma.product.findFirst({
        where: { slug, NOT: { id: productId } }
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
      updateData.slug = slug;
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        images: true,
        variants: true,
        category: true,
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true
          }
        }
      }
    });

    return updatedProduct;
  }

  /**
   * Delete product
   */
  async deleteProduct(productId, sellerId) {
    // Verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new Error('Unauthorized to delete this product');
    }

    // Soft delete by archiving
    await prisma.product.update({
      where: { id: productId },
      data: { status: 'ARCHIVED' }
    });

    return { message: 'Product archived successfully' };
  }

  /**
   * Publish product (change status to ACTIVE)
   */
  async publishProduct(productId, sellerId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new Error('Unauthorized to publish this product');
    }

    // Validation before publishing
    if (!product.images || product.images.length === 0) {
      throw new Error('Product must have at least one image');
    }

    if (!product.description || product.description.trim() === '') {
      throw new Error('Product must have a description');
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        status: 'ACTIVE',
        publishedAt: new Date()
      },
      include: {
        images: true,
        variants: true,
        category: true
      }
    });

    return updatedProduct;
  }

  /**
   * Add product images
   */
  async addProductImages(productId, sellerId, images) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new Error('Unauthorized');
    }

    const existingImagesCount = await prisma.productImage.count({
      where: { productId }
    });

    const createdImages = await Promise.all(
      images.map((img, index) =>
        prisma.productImage.create({
          data: {
            productId,
            imageUrl: img.url,
            altText: img.altText || product.title,
            displayOrder: existingImagesCount + index,
            isPrimary: existingImagesCount === 0 && index === 0
          }
        })
      )
    );

    return createdImages;
  }

  /**
   * Delete product image
   */
  async deleteProductImage(productId, imageId, sellerId) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || product.sellerId !== sellerId) {
      throw new Error('Unauthorized');
    }

    await prisma.productImage.delete({
      where: { id: imageId }
    });

    return { message: 'Image deleted successfully' };
  }

  /**
   * Get seller's products
   */
  async getSellerProducts(sellerId, filters = {}) {
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      sellerId,
      ...(status && { status })
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1
          },
          category: true,
          _count: {
            select: { reviews: true, orderItems: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export default new ProductService();
