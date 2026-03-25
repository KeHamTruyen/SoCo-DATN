import prisma from '../config/database.js';

function deriveTaggedProducts(post) {
  if (!post?.product) return undefined;
  const p = post.product;
  const img = p.images?.[0]?.imageUrl;
  return [
    {
      id: `embed-${post.id}-${p.id}`,
      productId: p.id,
      productName: p.title,
      price: Number(p.price) || 0,
      imageUrl: img,
      positionX: 50,
      positionY: 50,
    },
  ];
}

function enrichSingle(post, usersById) {
  const ids = Array.isArray(post.taggedUserIds) ? post.taggedUserIds : [];
  const taggedUsers = ids.map((id) => usersById.get(id)).filter(Boolean);
  // Omit `product` — it contains Prisma.Decimal `price` which can break JSON serialization;
  // clients use `taggedProducts` instead.
  const { likes, _count, isLiked, product: _product, ...rest } = post;
  return {
    ...rest,
    imageUrl: post.mediaUrls?.[0] || undefined,
    likedByMe: Boolean(isLiked),
    taggedProducts: deriveTaggedProducts(post),
    taggedUsers,
  };
}

/**
 * Batch-load tagged users and return client-oriented post shapes.
 * @param {object[]} posts
 */
export async function formatPostsForResponse(posts) {
  if (!posts?.length) return [];
  const ids = [
    ...new Set(
      posts.flatMap((p) => (Array.isArray(p.taggedUserIds) ? p.taggedUserIds : [])),
    ),
  ];
  const users = ids.length
    ? await prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, username: true, fullName: true, avatarUrl: true },
      })
    : [];
  const map = new Map(users.map((u) => [u.id, u]));
  return posts.map((p) => enrichSingle(p, map));
}

export async function formatPostForResponse(post) {
  const [formatted] = await formatPostsForResponse([post]);
  return formatted;
}
