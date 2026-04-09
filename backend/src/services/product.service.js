import prisma from '../config/database.js';
import slugify from 'slugify';
import { deleteImage, getPublicIdFromUrl } from '../config/cloudinary.js';

const RETENTION_DAYS = 180;

function computePurgeAfter(from = new Date()) {
  const out = new Date(from);
  out.setDate(out.getDate() + RETENTION_DAYS);
  return out;
}

function withPrimaryCategory(product) {
  if (!product || !Array.isArray(product.categories)) return product;
  const primaryCategory = product.categories[0] || null;
  return {
    ...product,
    categoryId: primaryCategory?.id || null,
    category: primaryCategory,
  };
}

function assertPublishReady({ description, imageCount }) {
  if (!description || description.trim() === '') {
    throw new Error('Product must have a description');
  }
  if (!Number.isFinite(imageCount) || imageCount <= 0) {
    throw new Error('Product must have at least one image');
  }
}

function normalizeSearchQuery(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .slice(0, 200);
}

function tokenize(value) {
  return normalizeSearchQuery(value)
    .split(' ')
    .map((part) => part.trim())
    .filter((part) => part.length > 1);
}

const SEARCH_STOPWORDS = new Set([
  'va',
  'và',
  'the',
  'for',
  'with',
  'san',
  'pham',
  'product'
]);

function hasDelegate(name) {
  return Boolean(prisma?.[name] && typeof prisma[name].findMany === 'function');
}

function isMissingTableError(error) {
  return (
    error?.code === 'P2021' ||
    error?.code === 'P2022' ||
    /does not exist|Unknown arg|Cannot read properties of undefined/i.test(String(error?.message || ''))
  );
}

class ProductService {
  async appendDeletionAudit(productId, event, { actorId = null, actorRole = null, reason = null, meta = {} } = {}) {
    await prisma.productDeletionAudit.create({
      data: {
        productId,
        event,
        actorId,
        actorRole,
        reason,
        meta
      }
    });
  }

  /**
   * Create a new product
   */
  async createProduct(sellerId, data) {
    const { title, description, price, categoryIds, images, variants, ...rest } = data;

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
        categories:
          Array.isArray(categoryIds) && categoryIds.length > 0
            ? { connect: categoryIds.map((id) => ({ id })) }
            : undefined,
        ...rest,
        status: 'DRAFT',
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
        categories: true,
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

    return withPrimaryCategory(product);
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
      ratingFilter,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const isPublicListing = !sellerId;
    const effectiveStatus = isPublicListing ? 'ACTIVE' : status;

    const ratingWhere =
      ratingFilter === '5_only'
        ? {
            reviews: {
              some: {
                isPublished: true,
                rating: 5
              },
              none: {
                isPublished: true,
                rating: { lt: 5 }
              }
            }
          }
        : ratingFilter === '4_plus'
          ? { reviews: { some: { isPublished: true, rating: { gte: 4 } } } }
          : ratingFilter === '3_plus'
            ? { reviews: { some: { isPublished: true, rating: { gte: 3 } } } }
            : ratingFilter === '2_plus'
              ? { reviews: { some: { isPublished: true, rating: { gte: 2 } } } }
              : ratingFilter === '1_plus'
                ? { reviews: { some: { isPublished: true, rating: { gte: 1 } } } }
                : {};

    const where = {
      deletedAt: null,
      ...(categoryId && { categories: { some: { id: categoryId } } }),
      ...(sellerId && { sellerId }),
      ...(effectiveStatus && { status: effectiveStatus }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { metaTitle: { contains: search, mode: 'insensitive' } },
          { metaDescription: { contains: search, mode: 'insensitive' } },
          { metaKeywords: { has: search } }
        ]
      }),
      ...(minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) })
        }
      },
      ...ratingWhere
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
          categories: true,
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
      products: products.map(withPrimaryCategory),
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
        deletedAt: null,
        status: 'ACTIVE',
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
        categories: true,
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

    return withPrimaryCategory(product);
  }

  async trackProductView(productId, userId, payload = {}) {
    const viewedFromProductId =
      payload.previousProductId && payload.previousProductId !== productId
        ? payload.previousProductId
        : null;
    const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId.slice(0, 100) : null;

    try {
      await prisma.productView.create({
        data: {
          productId,
          userId: userId || null,
          viewedFromProductId,
          sessionId
        }
      });
    } catch (error) {
      if (!isMissingTableError(error)) throw error;
      return;
    }

    if (viewedFromProductId && hasDelegate('productCoView')) {
      try {
        await prisma.productCoView.upsert({
          where: {
            sourceProductId_targetProductId: {
              sourceProductId: viewedFromProductId,
              targetProductId: productId
            }
          },
          update: {
            score: { increment: 1 },
            lastViewedAt: new Date()
          },
          create: {
            sourceProductId: viewedFromProductId,
            targetProductId: productId,
            score: 1,
            lastViewedAt: new Date()
          }
        });
      } catch (error) {
        if (!isMissingTableError(error)) throw error;
      }
    }
  }

  async trackSearchEvent(userId, payload = {}) {
    const normalizedQuery = normalizeSearchQuery(payload.query);
    if (!normalizedQuery) return;
    if (!hasDelegate('userSearchEvent')) return;
    const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId.slice(0, 100) : null;
    try {
      await prisma.userSearchEvent.create({
        data: {
          userId,
          query: String(payload.query).trim().slice(0, 200),
          normalizedQuery,
          sessionId
        }
      });
    } catch (error) {
      if (!isMissingTableError(error)) throw error;
    }
  }

  async getPersonalizedRecommendations(userId, options = {}) {
    const take = Number.isFinite(Number(options.limit))
      ? Math.min(Math.max(parseInt(options.limit, 10), 4), 48)
      : 24;
    const now = Date.now();
    const recentViews = await prisma.productView.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 60,
      include: {
        product: {
          select: {
            id: true,
            categories: { select: { id: true, name: true } }
          }
        }
      }
    });
    let searchEvents = [];
    if (hasDelegate('userSearchEvent')) {
      try {
        searchEvents = await prisma.userSearchEvent.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 40
        });
      } catch (error) {
        if (!isMissingTableError(error)) throw error;
      }
    }

    const candidateScores = new Map();
    const categoryWeights = new Map();
    const tagWeights = new Map();

    for (const view of recentViews) {
      const ageHours = Math.max(1, (now - new Date(view.createdAt).getTime()) / (1000 * 60 * 60));
      const recencyWeight = 1 / (1 + ageHours / 24);
      for (const category of view.product?.categories || []) {
        categoryWeights.set(
          category.id,
          (categoryWeights.get(category.id) || 0) + recencyWeight * 2
        );
      }
    }

    for (const event of searchEvents) {
      const ageHours = Math.max(1, (now - new Date(event.createdAt).getTime()) / (1000 * 60 * 60));
      const recencyWeight = 1 / (1 + ageHours / 24);
      for (const token of tokenize(event.normalizedQuery)) {
        if (SEARCH_STOPWORDS.has(token)) continue;
        tagWeights.set(token, (tagWeights.get(token) || 0) + recencyWeight * 3);
      }
    }

    const viewedProductIds = Array.from(new Set(recentViews.map((view) => view.productId)));
    if (viewedProductIds.length > 0) {
      let coViews = [];
      if (hasDelegate('productCoView')) {
        try {
          coViews = await prisma.productCoView.findMany({
            where: { sourceProductId: { in: viewedProductIds } },
            orderBy: [{ score: 'desc' }, { lastViewedAt: 'desc' }],
            take: 120
          });
        } catch (error) {
          if (!isMissingTableError(error)) throw error;
        }
      }
      for (const edge of coViews) {
        candidateScores.set(
          edge.targetProductId,
          (candidateScores.get(edge.targetProductId) || 0) + edge.score * 1.5
        );
      }
    }

    const topCategoryIds = Array.from(categoryWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([categoryId]) => categoryId);
    const topTags = Array.from(tagWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);

    const queryTokens = topTags.slice(0, 6);
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        OR: [
          ...(topCategoryIds.length > 0
            ? [{ categories: { some: { id: { in: topCategoryIds } } } }]
            : []),
          ...(queryTokens.length > 0
            ? queryTokens.flatMap((token) => [
                { title: { contains: token, mode: 'insensitive' } },
                { description: { contains: token, mode: 'insensitive' } },
                { metaTitle: { contains: token, mode: 'insensitive' } },
                { metaDescription: { contains: token, mode: 'insensitive' } },
                { metaKeywords: { has: token } }
              ])
            : []),
          { id: { in: Array.from(candidateScores.keys()) } }
        ]
      },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        categories: true,
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
      },
      take: take * 3
    });

    const ranked = products
      .map((product) => {
        const productCategories = product.categories || [];
        const categoryScore = productCategories.reduce(
          (sum, category) => sum + (categoryWeights.get(category.id) || 0),
          0
        );
        const keywordScore = (product.metaKeywords || []).reduce(
          (sum, keyword) => sum + (tagWeights.get(normalizeSearchQuery(keyword)) || 0),
          0
        );
        const behaviorScore = candidateScores.get(product.id) || 0;
        const popularityScore = product.salesCount * 0.25 + product.viewsCount * 0.03;
        const freshnessDays =
          (now - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const freshnessBoost = Math.max(0, 12 - freshnessDays) * 0.3;
        const score =
          behaviorScore * 1.4 +
          categoryScore * 1.2 +
          keywordScore * 1.3 +
          popularityScore +
          freshnessBoost;
        return { product, score };
      })
      .sort((a, b) => b.score - a.score);

    const selected = [];
    const sellerSeen = new Map();
    for (const row of ranked) {
      const sellerId = row.product.sellerId;
      const count = sellerSeen.get(sellerId) || 0;
      if (count >= 3) continue;
      selected.push(withPrimaryCategory(row.product));
      sellerSeen.set(sellerId, count + 1);
      if (selected.length >= take) break;
    }

    if (selected.length < Math.min(8, take)) {
      const fallback = await prisma.product.findMany({
        where: { deletedAt: null, status: 'ACTIVE' },
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          categories: true,
          seller: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true
            }
          },
          _count: { select: { reviews: true } }
        },
        orderBy: [{ salesCount: 'desc' }, { createdAt: 'desc' }],
        take: take
      });
      const existing = new Set(selected.map((product) => product.id));
      for (const product of fallback) {
        if (existing.has(product.id)) continue;
        selected.push(withPrimaryCategory(product));
        if (selected.length >= take) break;
      }
    }

    const categoryIdsInReco = new Set(
      selected
        .flatMap((product) => product.categories || [])
        .map((category) => category.id)
    );
    const categories = await prisma.category.findMany({
      where: {
        id: { in: Array.from(categoryIdsInReco) },
        isActive: true
      },
      select: { id: true, name: true },
      take: 12
    });

    const productTags = selected
      .flatMap((product) => product.metaKeywords || [])
      .map((keyword) => normalizeSearchQuery(keyword))
      .filter((keyword) => keyword && !SEARCH_STOPWORDS.has(keyword));

    const mergedTags = Array.from(
      new Set([...topTags, ...productTags].filter(Boolean))
    ).slice(0, 12);

    return {
      products: selected,
      categories,
      tags: mergedTags
    };
  }

  /**
   * Update product
   */
  async updateProduct(productId, sellerId, data) {
    // Verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
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

    const finalStatus = updateData.status ?? product.status;
    const finalDescription = updateData.description !== undefined ? updateData.description : product.description;
    if (finalStatus === 'ACTIVE') {
      assertPublishReady({
        description: finalDescription,
        imageCount: product.images?.length ?? 0
      });
    }

    // Update product
    const updatePayload = { ...updateData };
    if (updateData.categoryIds !== undefined) {
      updatePayload.categories = {
        set: (updateData.categoryIds || []).map((id) => ({ id }))
      };
      delete updatePayload.categoryIds;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updatePayload,
      include: {
        images: true,
        variants: true,
        categories: true,
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

    return withPrimaryCategory(updatedProduct);
  }

  /**
   * Delete product
   */
  async deleteProduct(productId, sellerId, reason) {
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

    const now = new Date();
    const purgeAfter = computePurgeAfter(now);

    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: {
          deletionState: 'SOFT_DELETED',
          deletedAt: now,
          deletedBy: sellerId,
          purgeAfter,
          deleteReason: reason || null
        }
      }),
      prisma.productDeletionAudit.create({
        data: {
          productId,
          actorId: sellerId,
          actorRole: 'SELLER',
          event: 'PRODUCT_SOFT_DELETED',
          reason: reason || null,
          meta: { purgeAfter: purgeAfter.toISOString() }
        }
      })
    ]);

    return { message: 'Product deleted successfully' };
  }

  async restoreProduct(productId, sellerId) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) throw new Error('Product not found');
    if (product.sellerId !== sellerId) throw new Error('Unauthorized to restore this product');
    if (!product.deletedAt || product.deletionState !== 'SOFT_DELETED') {
      throw new Error('Product is not deleted');
    }
    if (product.purgeAfter && product.purgeAfter <= new Date()) {
      throw new Error('Restore window expired');
    }

    const restored = await prisma.product.update({
      where: { id: productId },
      data: {
        deletedAt: null,
        deletedBy: null,
        deleteReason: null,
        purgeAfter: null,
        deletionState: 'ACTIVE',
        lastPurgeError: null,
        status: 'DRAFT'
      },
      include: { images: true, variants: true, categories: true }
    });

    await this.appendDeletionAudit(productId, 'PRODUCT_RESTORED', {
      actorId: sellerId,
      actorRole: 'SELLER'
    });

    return withPrimaryCategory(restored);
  }

  async listPurgeCandidates(now = new Date(), take = 50) {
    return prisma.product.findMany({
      where: {
        purgeAfter: { lte: now },
        deletionState: { in: ['SOFT_DELETED', 'PURGE_FAILED'] }
      },
      take,
      orderBy: { purgeAfter: 'asc' },
      include: {
        images: { select: { id: true, imageUrl: true } }
      }
    });
  }

  async purgeProduct(productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: { select: { imageUrl: true } } }
    });
    if (!product) return { id: productId, purged: true, skipped: 'NOT_FOUND' };

    await prisma.product.update({
      where: { id: productId },
      data: { deletionState: 'PURGED_PENDING', lastPurgeError: null }
    });

    await this.appendDeletionAudit(productId, 'PRODUCT_PURGE_STARTED', {
      actorRole: 'SYSTEM',
      meta: { imageCount: product.images.length }
    });

    const assetErrors = [];
    for (const image of product.images) {
      const publicId = getPublicIdFromUrl(image.imageUrl);
      if (!publicId) continue;
      try {
        await deleteImage(publicId);
      } catch (error) {
        assetErrors.push(error?.message || 'Asset deletion failed');
      }
    }

    if (assetErrors.length > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          deletionState: 'PURGE_FAILED',
          lastPurgeError: assetErrors[0]
        }
      });
      await this.appendDeletionAudit(productId, 'PRODUCT_PURGE_FAILED', {
        actorRole: 'SYSTEM',
        reason: assetErrors[0],
        meta: { errors: assetErrors }
      });
      throw new Error(assetErrors[0]);
    }

    await this.appendDeletionAudit(productId, 'PRODUCT_PURGE_COMPLETED', {
      actorRole: 'SYSTEM'
    });
    await prisma.product.delete({ where: { id: productId } });
    return { id: productId, purged: true };
  }

  async purgeExpiredProducts({ now = new Date(), take = 25 } = {}) {
    const candidates = await this.listPurgeCandidates(now, take);
    const result = { total: candidates.length, purged: 0, failed: 0 };

    for (const candidate of candidates) {
      try {
        await this.purgeProduct(candidate.id);
        result.purged += 1;
      } catch {
        result.failed += 1;
      }
    }

    return result;
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

    assertPublishReady({
      description: product.description,
      imageCount: product.images?.length ?? 0
    });

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        status: 'ACTIVE',
        publishedAt: new Date()
      },
      include: {
        images: true,
        variants: true,
        categories: true
      }
    });

    return withPrimaryCategory(updatedProduct);
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
      where: { id: productId },
      include: { images: { select: { id: true } } }
    });

    if (!product || product.sellerId !== sellerId) {
      throw new Error('Unauthorized');
    }

    const hasTargetImage = product.images.some((image) => image.id === imageId);
    if (!hasTargetImage) {
      throw new Error('Image not found');
    }
    if (product.status === 'ACTIVE' && product.images.length <= 1) {
      throw new Error('Active product must keep at least one image');
    }

    await prisma.productImage.delete({
      where: { id: imageId }
    });

    return { message: 'Image deleted successfully' };
  }

  /**
   * Get one product for seller dashboard (edit form). Does not increment viewsCount.
   */
  async getSellerProductById(sellerId, productId) {
    const product = await prisma.product.findFirst({
      where: { id: productId, sellerId, deletedAt: null },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }
        },
        categories: true,
        variants: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return withPrimaryCategory(product);
  }

  /**
   * List variants for seller's product
   */
  async listSellerProductVariants(sellerId, productId) {
    const product = await prisma.product.findFirst({
      where: { id: productId, sellerId },
      select: { id: true }
    });
    if (!product) {
      throw new Error('Product not found');
    }
    return prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Create variant for seller's product
   */
  async createSellerProductVariant(sellerId, productId, data) {
    const product = await prisma.product.findFirst({
      where: { id: productId, sellerId }
    });
    if (!product) {
      throw new Error('Product not found');
    }

    const {
      name,
      sku,
      price,
      stockQuantity = 0,
      options = {},
      isActive = true
    } = data;

    return prisma.productVariant.create({
      data: {
        productId,
        variantName: name.trim(),
        sku: sku?.trim() || null,
        price: price != null ? price : null,
        stockQuantity,
        options: typeof options === 'object' && options !== null && !Array.isArray(options) ? options : {},
        isActive
      }
    });
  }

  /**
   * Update variant (seller ownership)
   */
  async updateSellerProductVariant(sellerId, productId, variantId, data) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      include: { product: { select: { sellerId: true } } }
    });
    if (!variant) {
      throw new Error('Variant not found');
    }
    if (variant.product.sellerId !== sellerId) {
      throw new Error('Unauthorized to update this variant');
    }

    const patch = {};
    if (data.name !== undefined) patch.variantName = data.name.trim();
    if (data.sku !== undefined) patch.sku = data.sku?.trim() || null;
    if (data.price !== undefined) patch.price = data.price;
    if (data.stockQuantity !== undefined) patch.stockQuantity = data.stockQuantity;
    if (data.options !== undefined) {
      patch.options =
        typeof data.options === 'object' && data.options !== null && !Array.isArray(data.options)
          ? data.options
          : {};
    }
    if (data.isActive !== undefined) patch.isActive = data.isActive;

    return prisma.productVariant.update({
      where: { id: variantId },
      data: patch
    });
  }

  /**
   * Delete variant or soft-deactivate if referenced by cart/orders
   */
  async deleteSellerProductVariant(sellerId, productId, variantId) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      include: { product: { select: { sellerId: true } } }
    });
    if (!variant) {
      throw new Error('Variant not found');
    }
    if (variant.product.sellerId !== sellerId) {
      throw new Error('Unauthorized to delete this variant');
    }

    const [cartCount, orderCount] = await Promise.all([
      prisma.cartItem.count({ where: { variantId } }),
      prisma.orderItem.count({ where: { variantId } })
    ]);

    if (cartCount + orderCount > 0) {
      return prisma.productVariant.update({
        where: { id: variantId },
        data: { isActive: false }
      });
    }

    await prisma.productVariant.delete({ where: { id: variantId } });
    return { id: variantId, deleted: true };
  }

  /**
   * Get seller's products
   */
  async getSellerProducts(sellerId, filters = {}) {
    const { status, page = 1, limit = 20, includeDeleted } = filters;
    const skip = (page - 1) * limit;
    const deletedOnly = status === 'DELETED';

    const where = {
      sellerId,
      ...(deletedOnly
        ? { deletedAt: { not: null } }
        : includeDeleted === 'true'
          ? {}
          : { deletedAt: null }),
      ...(status && status !== 'DELETED' ? { status } : {})
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
          categories: true,
          _count: {
            select: { reviews: true, orderItems: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products: products.map(withPrimaryCategory),
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
