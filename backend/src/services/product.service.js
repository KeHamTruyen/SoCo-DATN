import prisma from '../config/database.js';
import slugify from 'slugify';
import { trackProductView } from './analytics.service.js';
import { deleteImage, getPublicIdFromUrl } from '../config/cloudinary.js';

const TRENDING_DEFAULT_DAYS = 30;
const TRENDING_DEFAULT_LIMIT = 12;

const assertSellerCanManageProducts = async (sellerId) => {
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      role: true,
      isVerified: true,
      sellerVerification: {
        select: {
          status: true
        }
      }
    }
  });

  if (!seller) {
    throw new Error('Seller not found');
  }

  if (seller.role === 'ADMIN') {
    return;
  }

  if (
    seller.role !== 'SELLER' ||
    !seller.isVerified ||
    seller.sellerVerification?.status !== 'APPROVED'
  ) {
    throw new Error('Seller verification approval is required to create products');
  }
};

class ProductService {
  /**
   * Create a new product
   */
  async createProduct(sellerId, data) {
    const { title, description, price, categoryId, images, variants, ...rest } = data;

    await assertSellerCanManageProducts(sellerId);

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
  async getProduct(identifier, viewContext = {}) {
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

    try {
      await trackProductView({
        productId: product.id,
        userId: viewContext.userId,
        sessionId: viewContext.sessionId,
        ipAddress: viewContext.ipAddress,
        userAgent: viewContext.userAgent
      });
    } catch (error) {
      // Product response should not fail because of analytics tracking.
    }

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

    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId
      }
    });

    if (!image) {
      throw new Error('Image not found');
    }

    const cloudPublicId = getPublicIdFromUrl(image.imageUrl);

    await prisma.productImage.delete({ where: { id: imageId } });

    if (cloudPublicId) {
      try {
        await deleteImage(cloudPublicId);
      } catch (error) {
        // Keep product image deletion successful even if cloud cleanup fails.
      }
    }

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

  /**
   * Get trending products based on recent paid sales and engagement
   */
  async getTrendingProducts(filters = {}) {
    const days = Math.min(Math.max(parseInt(filters.days, 10) || TRENDING_DEFAULT_DAYS, 1), 365);
    const limit = Math.min(Math.max(parseInt(filters.limit, 10) || TRENDING_DEFAULT_LIMIT, 1), 50);
    const since = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

    const salesByProduct = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { not: null },
        order: {
          createdAt: { gte: since },
          paymentStatus: 'PAID',
          status: { in: ['DELIVERED', 'COMPLETED'] }
        },
        product: {
          status: 'ACTIVE'
        }
      },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: limit * 3
    });

    if (salesByProduct.length === 0) {
      return {
        periodDays: days,
        items: []
      };
    }

    const productIds = salesByProduct.map((row) => row.productId).filter(Boolean);

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'ACTIVE'
      },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
          take: 1
        },
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    });

    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    const items = salesByProduct
      .map((salesRow) => {
        const product = productMap[salesRow.productId];
        if (!product) {
          return null;
        }

        const soldQuantity = Number(salesRow._sum.quantity || 0);
        const revenue = Number(salesRow._sum.totalPrice || 0);

        // Weighted score balances real sales with current engagement signals.
        const trendScore = (soldQuantity * 8)
          + (revenue / 100000)
          + (product.viewsCount * 0.05)
          + (product.likesCount * 0.5)
          + (product._count.reviews * 2);

        return {
          product,
          metrics: {
            soldQuantity,
            revenue,
            trendScore: Number(trendScore.toFixed(2)),
            periodDays: days
          }
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.metrics.trendScore - a.metrics.trendScore)
      .slice(0, limit);

    return {
      periodDays: days,
      items
    };
  }
}

export default new ProductService();
