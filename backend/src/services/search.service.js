import prisma from '../config/database.js';

const MAX_LIMIT = 50;

const toPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1)
});

const normalizeListParams = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

const normalizeBoolean = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (String(value) === 'true') return true;
  if (String(value) === 'false') return false;
  return undefined;
};

const normalizeDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
};

export const searchProducts = async (query = {}) => {
  const { page, limit, skip } = normalizeListParams(query);
  const keyword = String(query.q || query.search || '').trim();
  const minPrice = query.minPrice !== undefined ? Number(query.minPrice) : undefined;
  const maxPrice = query.maxPrice !== undefined ? Number(query.maxPrice) : undefined;
  const sortBy = ['createdAt', 'price', 'viewsCount', 'salesCount', 'title'].includes(query.sortBy)
    ? query.sortBy
    : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  const where = {
    status: query.status || 'ACTIVE',
    ...(query.categoryId && { categoryId: query.categoryId }),
    ...(query.sellerId && { sellerId: query.sellerId }),
    ...(keyword && {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } }
      ]
    }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && !Number.isNaN(minPrice) && { gte: minPrice }),
        ...(maxPrice !== undefined && !Number.isNaN(maxPrice) && { lte: maxPrice })
      }
    })
  };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
          take: 1,
          select: { imageUrl: true, altText: true }
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
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    }),
    prisma.product.count({ where })
  ]);

  return {
    data,
    pagination: toPagination(page, limit, total)
  };
};

export const searchUsers = async (query = {}) => {
  const { page, limit, skip } = normalizeListParams(query);
  const keyword = String(query.q || '').trim();
  const verified = normalizeBoolean(query.verified);

  const where = {
    isActive: true,
    ...(query.role && { role: query.role }),
    ...(verified !== undefined && { isVerified: verified }),
    ...(keyword && {
      OR: [
        { username: { contains: keyword, mode: 'insensitive' } },
        { fullName: { contains: keyword, mode: 'insensitive' } },
        { bio: { contains: keyword, mode: 'insensitive' } }
      ]
    })
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { isVerified: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            products: true,
            posts: true
          }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  return {
    data,
    pagination: toPagination(page, limit, total)
  };
};

export const searchPosts = async (query = {}, viewerId = null) => {
  const { page, limit, skip } = normalizeListParams(query);
  const keyword = String(query.q || '').trim();
  const dateFrom = normalizeDate(query.dateFrom);
  const dateTo = normalizeDate(query.dateTo);

  const where = {
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    ...(query.authorId && { authorId: query.authorId }),
    ...(keyword && {
      content: {
        contains: keyword,
        mode: 'insensitive'
      }
    }),
    ...((dateFrom || dateTo) && {
      createdAt: {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo })
      }
    })
  };

  const [data, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
            role: true
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: {
                imageUrl: true
              }
            }
          }
        },
        likes: viewerId
          ? {
              where: { userId: viewerId },
              select: { id: true }
            }
          : false,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    }),
    prisma.post.count({ where })
  ]);

  if (viewerId) {
    data.forEach((post) => {
      post.isLiked = post.likes && post.likes.length > 0;
      delete post.likes;
    });
  }

  return {
    data,
    pagination: toPagination(page, limit, total)
  };
};

export const searchAll = async (query = {}, viewerId = null) => {
  const [products, users, posts] = await Promise.all([
    searchProducts({ ...query, page: 1, limit: Math.min(parseInt(query.limit, 10) || 10, 10) }),
    searchUsers({ ...query, page: 1, limit: Math.min(parseInt(query.limit, 10) || 10, 10) }),
    searchPosts({ ...query, page: 1, limit: Math.min(parseInt(query.limit, 10) || 10, 10) }, viewerId)
  ]);

  return {
    products: products.data,
    users: users.data,
    posts: posts.data,
    totals: {
      products: products.pagination.total,
      users: users.pagination.total,
      posts: posts.pagination.total
    }
  };
};