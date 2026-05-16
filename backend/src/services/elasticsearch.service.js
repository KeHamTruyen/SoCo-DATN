import prisma from '../config/database.js';
import {
  getElasticsearchClient,
  isElasticsearchConfigured,
  SEARCH_INDEXES,
} from '../config/elasticsearch.js';
import { logError, logInfo, logWarn } from '../utils/logger.js';

const INDEX_SETTINGS = {
  settings: {
    analysis: {
      normalizer: {
        lowercase_keyword: {
          type: 'custom',
          filter: ['lowercase', 'asciifolding'],
        },
      },
      analyzer: {
        soco_text: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding'],
        },
      },
    },
  },
};

const INDEX_MAPPINGS = {
  products: {
    ...INDEX_SETTINGS,
    mappings: {
      properties: {
        id: { type: 'keyword' },
        title: { type: 'text', analyzer: 'soco_text', fields: { keyword: { type: 'keyword', normalizer: 'lowercase_keyword' } } },
        slug: { type: 'keyword' },
        description: { type: 'text', analyzer: 'soco_text' },
        metaTitle: { type: 'text', analyzer: 'soco_text' },
        metaDescription: { type: 'text', analyzer: 'soco_text' },
        metaKeywords: { type: 'keyword', normalizer: 'lowercase_keyword' },
        categoryIds: { type: 'keyword' },
        categoryNames: { type: 'text', analyzer: 'soco_text' },
        sellerId: { type: 'keyword' },
        sellerName: { type: 'text', analyzer: 'soco_text' },
        status: { type: 'keyword' },
        deletedAt: { type: 'date' },
        price: { type: 'double' },
        viewsCount: { type: 'integer' },
        salesCount: { type: 'integer' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },
  },
  users: {
    ...INDEX_SETTINGS,
    mappings: {
      properties: {
        id: { type: 'keyword' },
        username: { type: 'text', analyzer: 'soco_text', fields: { keyword: { type: 'keyword', normalizer: 'lowercase_keyword' } } },
        fullName: { type: 'text', analyzer: 'soco_text' },
        bio: { type: 'text', analyzer: 'soco_text' },
        role: { type: 'keyword' },
        isActive: { type: 'boolean' },
        isVerified: { type: 'boolean' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },
  },
  posts: {
    ...INDEX_SETTINGS,
    mappings: {
      properties: {
        id: { type: 'keyword' },
        authorId: { type: 'keyword' },
        authorName: { type: 'text', analyzer: 'soco_text' },
        content: { type: 'text', analyzer: 'soco_text' },
        location: { type: 'text', analyzer: 'soco_text' },
        feeling: { type: 'keyword' },
        groupId: { type: 'keyword' },
        status: { type: 'keyword' },
        visibility: { type: 'keyword' },
        likesCount: { type: 'integer' },
        commentsCount: { type: 'integer' },
        sharesCount: { type: 'integer' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },
  },
  groups: {
    ...INDEX_SETTINGS,
    mappings: {
      properties: {
        id: { type: 'keyword' },
        name: { type: 'text', analyzer: 'soco_text', fields: { keyword: { type: 'keyword', normalizer: 'lowercase_keyword' } } },
        slug: { type: 'keyword' },
        description: { type: 'text', analyzer: 'soco_text' },
        privacy: { type: 'keyword' },
        createdBy: { type: 'keyword' },
        memberIds: { type: 'keyword' },
        membersCount: { type: 'integer' },
        postsCount: { type: 'integer' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    },
  },
};

function normalizeSearchText(value) {
  return String(value ?? '').trim();
}

function hasSearchText(value) {
  return normalizeSearchText(value).length > 0;
}

function idsFromHits(response) {
  return (response?.hits?.hits || [])
    .map((hit) => hit?._source?.id || hit?._id)
    .filter(Boolean);
}

function totalFromHits(response) {
  const total = response?.hits?.total;
  if (typeof total === 'number') return total;
  if (total && typeof total.value === 'number') return total.value;
  return idsFromHits(response).length;
}

function isIndexUnavailable(error) {
  return error?.meta?.statusCode === 404 || /index_not_found/i.test(String(error?.message || ''));
}

function productSort(sortBy = 'createdAt', sortOrder = 'desc', hasQuery = false) {
  const direction = sortOrder === 'asc' ? 'asc' : 'desc';
  const sortable = {
    createdAt: { createdAt: { order: direction } },
    price: { price: { order: direction } },
    viewsCount: { viewsCount: { order: direction } },
    salesCount: { salesCount: { order: direction } },
    title: { 'title.keyword': { order: direction } },
  };
  if (hasQuery && (!sortBy || sortBy === 'relevance')) {
    return [{ _score: { order: 'desc' } }, { salesCount: { order: 'desc' } }];
  }
  return [sortable[sortBy] || sortable.createdAt];
}

function keywordQuery(query, fields) {
  if (!hasSearchText(query)) return { match_all: {} };
  return {
    multi_match: {
      query: normalizeSearchText(query),
      fields,
      type: 'best_fields',
      fuzziness: 'AUTO',
      operator: 'and',
    },
  };
}

function buildSearchResult(response) {
  return {
    ids: idsFromHits(response),
    total: totalFromHits(response),
  };
}

async function safeSearch(kind, request) {
  const client = getElasticsearchClient();
  if (!client) return null;
  try {
    const response = await client.search(request);
    return buildSearchResult(response);
  } catch (error) {
    if (!isIndexUnavailable(error)) {
      logWarn(`Elasticsearch ${kind} search failed; falling back to Prisma`, {
        message: error.message,
      });
    }
    return null;
  }
}

export async function searchProducts(filters = {}) {
  if (!isElasticsearchConfigured() || !hasSearchText(filters.search)) return null;
  if (filters.ratingFilter) return null;

  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 20, 1), 100);
  const must = [
    keywordQuery(filters.search, [
      'title^4',
      'metaTitle^3',
      'metaKeywords^3',
      'categoryNames^2',
      'sellerName',
      'description',
      'metaDescription',
    ]),
  ];
  const filter = [];
  const statusFilter = filters.sellerId ? filters.status : 'ACTIVE';
  if (statusFilter) filter.push({ term: { status: statusFilter } });
  const mustNot = [{ exists: { field: 'deletedAt' } }];

  if (filters.categoryId) filter.push({ term: { categoryIds: filters.categoryId } });
  if (filters.sellerId) filter.push({ term: { sellerId: filters.sellerId } });
  const price = {};
  if (filters.minPrice) price.gte = Number(filters.minPrice);
  if (filters.maxPrice) price.lte = Number(filters.maxPrice);
  if (Object.keys(price).length > 0) filter.push({ range: { price } });

  return safeSearch('product', {
    index: SEARCH_INDEXES.products,
    from: (page - 1) * limit,
    size: limit,
    query: { bool: { must, filter, must_not: mustNot } },
    sort: productSort(filters.sortBy, filters.sortOrder, true),
    track_total_hits: true,
  });
}

export async function searchUsers(query, { page = 1, limit = 20, scopedUserIds = null } = {}) {
  if (!isElasticsearchConfigured() || !hasSearchText(query)) return null;
  if (Array.isArray(scopedUserIds) && scopedUserIds.length === 0) return { ids: [], total: 0 };

  const filter = [{ term: { isActive: true } }];
  if (Array.isArray(scopedUserIds)) filter.push({ terms: { id: scopedUserIds } });

  return safeSearch('user', {
    index: SEARCH_INDEXES.users,
    from: (Math.max(parseInt(page, 10) || 1, 1) - 1) * limit,
    size: limit,
    query: {
      bool: {
        must: [keywordQuery(query, ['username^4', 'fullName^3', 'bio'])],
        filter,
      },
    },
    sort: [{ _score: { order: 'desc' } }, { createdAt: { order: 'desc' } }],
    track_total_hits: true,
  });
}

export async function searchPosts(filters = {}) {
  if (!isElasticsearchConfigured() || !hasSearchText(filters.search)) return null;
  if (Array.isArray(filters.scopedAuthorIds) && filters.scopedAuthorIds.length === 0) {
    return { ids: [], total: 0 };
  }

  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 20, 1), 100);
  const filter = [
    { term: { status: filters.status || 'PUBLISHED' } },
    { term: { visibility: filters.visibility || 'PUBLIC' } },
  ];
  if (filters.authorId) filter.push({ term: { authorId: filters.authorId } });
  if (Array.isArray(filters.scopedAuthorIds)) filter.push({ terms: { authorId: filters.scopedAuthorIds } });
  if (filters.postedFrom || filters.postedTo) {
    filter.push({
      range: {
        createdAt: {
          ...(filters.postedFrom ? { gte: filters.postedFrom } : {}),
          ...(filters.postedTo ? { lte: filters.postedTo } : {}),
        },
      },
    });
  }

  return safeSearch('post', {
    index: SEARCH_INDEXES.posts,
    from: (page - 1) * limit,
    size: limit,
    query: {
      bool: {
        must: [keywordQuery(filters.search, ['content^4', 'authorName^2', 'location'])],
        filter,
      },
    },
    sort: [{ _score: { order: 'desc' } }, { createdAt: { order: 'desc' } }],
    track_total_hits: true,
  });
}

export async function searchGroups(filters = {}) {
  if (!isElasticsearchConfigured() || !hasSearchText(filters.search)) return null;
  if (filters.privacy === 'SECRET' && filters.userId) return null;

  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 20, 1), 100);
  const filter = [];
  if (filters.privacy) filter.push({ term: { privacy: filters.privacy } });
  else filter.push({ bool: { must_not: [{ term: { privacy: 'SECRET' } }] } });

  return safeSearch('group', {
    index: SEARCH_INDEXES.groups,
    from: (page - 1) * limit,
    size: limit,
    query: {
      bool: {
        must: [keywordQuery(filters.search, ['name^4', 'description'])],
        filter,
      },
    },
    sort: [{ _score: { order: 'desc' } }, { membersCount: { order: 'desc' } }],
    track_total_hits: true,
  });
}

export function orderBySearchIds(rows, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return rows;
  const rank = new Map(ids.map((id, index) => [id, index]));
  return [...rows].sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
}

async function createIndexIfMissing(index, body) {
  const client = getElasticsearchClient();
  if (!client) return;
  const exists = await client.indices.exists({ index });
  if (!exists) {
    await client.indices.create({ index, ...body });
  }
}

export async function ensureSearchIndexes() {
  if (!isElasticsearchConfigured()) {
    throw new Error('ELASTICSEARCH_URL or ELASTICSEARCH_CLOUD_ID is required');
  }
  await Promise.all([
    createIndexIfMissing(SEARCH_INDEXES.products, INDEX_MAPPINGS.products),
    createIndexIfMissing(SEARCH_INDEXES.users, INDEX_MAPPINGS.users),
    createIndexIfMissing(SEARCH_INDEXES.posts, INDEX_MAPPINGS.posts),
    createIndexIfMissing(SEARCH_INDEXES.groups, INDEX_MAPPINGS.groups),
  ]);
}

function productToDocument(product) {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    metaKeywords: product.metaKeywords || [],
    categoryIds: (product.categories || []).map((category) => category.id),
    categoryNames: (product.categories || []).map((category) => category.name),
    sellerId: product.sellerId,
    sellerName: product.seller?.fullName || product.seller?.username || null,
    status: product.status,
    deletedAt: product.deletedAt,
    price: Number(product.price || 0),
    viewsCount: product.viewsCount || 0,
    salesCount: product.salesCount || 0,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function userToDocument(user) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    bio: user.bio,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function postToDocument(post) {
  return {
    id: post.id,
    authorId: post.authorId,
    authorName: post.author?.fullName || post.author?.username || null,
    content: post.content,
    location: post.location,
    feeling: post.feeling,
    groupId: post.groupId,
    status: post.status,
    visibility: post.visibility,
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    sharesCount: post.sharesCount || 0,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function groupToDocument(group) {
  return {
    id: group.id,
    name: group.name,
    slug: group.slug,
    description: group.description,
    privacy: group.privacy,
    createdBy: group.createdBy,
    memberIds: (group.members || []).map((member) => member.userId),
    membersCount: group.membersCount || 0,
    postsCount: group.postsCount || 0,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

async function bulkIndex(index, rows, mapper) {
  const client = getElasticsearchClient();
  if (!client || rows.length === 0) return { indexed: 0 };

  const operations = rows.flatMap((row) => [
    { index: { _index: index, _id: row.id } },
    mapper(row),
  ]);
  const response = await client.bulk({ refresh: false, operations });
  if (response.errors) {
    const failures = response.items
      .filter((item) => item.index?.error)
      .slice(0, 5)
      .map((item) => item.index.error);
    logError('Elasticsearch bulk index completed with errors', { index, failures });
  }
  return { indexed: rows.length };
}

export async function reindexSearchDocuments({ batchSize = 500 } = {}) {
  await ensureSearchIndexes();
  const summary = {};

  const products = await prisma.product.findMany({
    include: {
      categories: { select: { id: true, name: true } },
      seller: { select: { username: true, fullName: true } },
    },
  });
  summary.products = await bulkIndex(SEARCH_INDEXES.products, products, productToDocument);

  const users = await prisma.user.findMany();
  summary.users = await bulkIndex(SEARCH_INDEXES.users, users, userToDocument);

  const posts = await prisma.post.findMany({
    include: { author: { select: { username: true, fullName: true } } },
  });
  summary.posts = await bulkIndex(SEARCH_INDEXES.posts, posts, postToDocument);

  const groups = await prisma.group.findMany({
    include: { members: { select: { userId: true } } },
  });
  summary.groups = await bulkIndex(SEARCH_INDEXES.groups, groups, groupToDocument);

  logInfo('Elasticsearch reindex completed', { summary, batchSize });
  return summary;
}

export default {
  searchProducts,
  searchUsers,
  searchPosts,
  searchGroups,
  orderBySearchIds,
  ensureSearchIndexes,
  reindexSearchDocuments,
};
