import prisma from '../config/database.js';

const AUTHOR_SELECT = {
  id: true,
  username: true,
  fullName: true,
  avatarUrl: true,
  isVerified: true,
  role: true,
};

const POST_INCLUDE = {
  author: { select: AUTHOR_SELECT },
  product: {
    select: {
      id: true,
      title: true,
      price: true,
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { imageUrl: true, altText: true },
      },
    },
  },
  _count: { select: { likes: true, comments: true } },
};

const PRODUCT_INCLUDE = {
  images: { orderBy: { displayOrder: 'asc' }, take: 1 },
  category: true,
  seller: {
    select: {
      id: true,
      username: true,
      fullName: true,
      avatarUrl: true,
    },
  },
};

function serializeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    price: p.price != null ? parseFloat(String(p.price)) : null,
    compareAtPrice: p.compareAtPrice != null ? parseFloat(String(p.compareAtPrice)) : null,
  };
}

function normalizeItemType(raw) {
  const u = String(raw || '').toUpperCase();
  if (u === 'POST') return 'POST';
  if (u === 'PRODUCT') return 'PRODUCT';
  return null;
}

export const listSavedItems = async (userId, query = {}) => {
  const {
    type = 'all',
    page = 1,
    limit = 20,
    q = '',
    categoryId,
    minPrice,
    maxPrice,
    sort = 'recent',
  } = query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

  let itemTypeFilter = {};
  if (type === 'posts') itemTypeFilter = { itemType: 'POST' };
  else if (type === 'products') itemTypeFilter = { itemType: 'PRODUCT' };

  const savedRows = await prisma.savedItem.findMany({
    where: { userId, ...itemTypeFilter },
    orderBy: { createdAt: 'desc' },
  });

  const postIds = savedRows.filter((s) => s.itemType === 'POST').map((s) => s.targetId);
  const productIds = savedRows.filter((s) => s.itemType === 'PRODUCT').map((s) => s.targetId);

  const [posts, products] = await Promise.all([
    postIds.length
      ? prisma.post.findMany({
          where: { id: { in: postIds }, status: 'PUBLISHED' },
          include: POST_INCLUDE,
        })
      : [],
    productIds.length
      ? prisma.product.findMany({
          where: { id: { in: productIds } },
          include: PRODUCT_INCLUDE,
        })
      : [],
  ]);

  const postMap = new Map(posts.map((p) => [p.id, p]));
  const productMap = new Map(products.map((p) => [p.id, p]));

  let items = savedRows
    .map((row) => {
      if (row.itemType === 'POST') {
        const post = postMap.get(row.targetId);
        if (!post) return null;
        return {
          id: row.id,
          itemType: 'POST',
          createdAt: row.createdAt,
          post,
        };
      }
      const product = productMap.get(row.targetId);
      if (!product) return null;
      return {
        id: row.id,
        itemType: 'PRODUCT',
        createdAt: row.createdAt,
        product: serializeProduct(product),
      };
    })
    .filter(Boolean);

  const term = q ? String(q).trim().toLowerCase() : '';
  if (term) {
    items = items.filter((it) => {
      if (it.post) {
        return (it.post.content || '').toLowerCase().includes(term);
      }
      return (it.product?.title || '').toLowerCase().includes(term);
    });
  }

  if (categoryId) {
    items = items.filter((it) => it.post || it.product?.categoryId === categoryId);
  }

  const minP = minPrice != null && minPrice !== '' ? parseFloat(minPrice) : null;
  const maxP = maxPrice != null && maxPrice !== '' ? parseFloat(maxPrice) : null;
  if (minP != null || maxP != null) {
    items = items.filter((it) => {
      if (!it.product) return true;
      const price = it.product.price;
      if (typeof price !== 'number' || Number.isNaN(price)) return false;
      if (minP != null && price < minP) return false;
      if (maxP != null && price > maxP) return false;
      return true;
    });
  }

  if (sort === 'price_asc' || sort === 'price_desc') {
    const dir = sort === 'price_asc' ? 1 : -1;
    items.sort((a, b) => {
      const pa = a.product ? a.product.price : null;
      const pb = b.product ? b.product.price : null;
      if (pa == null && pb == null) return new Date(b.createdAt) - new Date(a.createdAt);
      if (pa == null) return 1;
      if (pb == null) return -1;
      if (pa === pb) return new Date(b.createdAt) - new Date(a.createdAt);
      return (pa - pb) * dir;
    });
  } else {
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const total = items.length;
  const start = (pageNum - 1) * limitNum;
  const paginated = items.slice(start, start + limitNum);

  return {
    data: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limitNum),
    },
  };
};

export const addSavedItem = async (userId, { itemType: rawType, targetId }) => {
  const itemType = normalizeItemType(rawType);
  if (!itemType) {
    const err = new Error('Invalid itemType');
    err.statusCode = 400;
    throw err;
  }
  if (!targetId || typeof targetId !== 'string') {
    const err = new Error('targetId is required');
    err.statusCode = 400;
    throw err;
  }

  if (itemType === 'POST') {
    const post = await prisma.post.findFirst({
      where: { id: targetId, status: 'PUBLISHED' },
    });
    if (!post) {
      const err = new Error('Post not found');
      err.statusCode = 404;
      throw err;
    }
  } else {
    const product = await prisma.product.findFirst({
      where: { id: targetId, status: 'ACTIVE' },
    });
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
  }

  const existing = await prisma.savedItem.findFirst({
    where: { userId, itemType, targetId },
  });
  if (existing) return { saved: existing, created: false };

  const saved = await prisma.savedItem.create({
    data: { userId, itemType, targetId },
  });
  return { saved, created: true };
};

export const removeSavedItem = async (userId, savedItemId) => {
  const row = await prisma.savedItem.findFirst({
    where: { id: savedItemId, userId },
  });
  if (!row) {
    const err = new Error('Saved item not found');
    err.statusCode = 404;
    throw err;
  }
  await prisma.savedItem.delete({ where: { id: savedItemId } });
  return { message: 'Removed from saved items' };
};

export const lookupSavedItem = async (userId, rawType, targetId) => {
  const itemType = normalizeItemType(rawType);
  if (!itemType || !targetId) {
    const err = new Error('itemType and targetId are required');
    err.statusCode = 400;
    throw err;
  }
  const row = await prisma.savedItem.findFirst({
    where: { userId, itemType, targetId },
    select: { id: true },
  });
  return { id: row?.id ?? null };
};
