import cron from 'node-cron';
import prisma from '../config/database.js';
import productService from '../services/product.service.js';

/**
 * Publish scheduled posts whose scheduledTime has passed.
 * Runs every minute.
 */
async function publishScheduledPosts() {
  try {
    const now = new Date();

    const duePosts = await prisma.scheduledPost.findMany({
      where: {
        status: 'scheduled',
        scheduledTime: { lte: now },
      },
      include: {
        user: { select: { id: true, username: true } },
        productTags: true,
      },
    });

    for (const scheduled of duePosts) {
      try {
        const post = await prisma.$transaction(async (tx) => {
          const created = await tx.post.create({
            data: {
              authorId: scheduled.userId,
              content: scheduled.content,
              mediaUrls: scheduled.mediaUrls,
              mediaType: scheduled.mediaType,
              location: scheduled.location,
              feeling: scheduled.feeling,
              taggedUserIds: scheduled.taggedUserIds || [],
              status: 'PUBLISHED',
              visibility: scheduled.visibility || 'PUBLIC',
              publishedAt: now,
            },
          });
          if (scheduled.productTags?.length) {
            await tx.postProductTag.createMany({
              data: scheduled.productTags.map((tag) => ({
                postId: created.id,
                productId: tag.productId,
                anchorType: tag.anchorType,
                positionX: tag.positionX,
                positionY: tag.positionY,
                blockId: tag.blockId,
                startOffset: tag.startOffset,
                endOffset: tag.endOffset,
                sortOrder: tag.sortOrder,
              })),
            });
          }
          await tx.scheduledPost.update({
            where: { id: scheduled.id },
            data: {
              status: 'published',
              publishedPostId: created.id,
            },
          });
          return created;
        });

        console.log(`📬 Published scheduled post ${scheduled.id} → post ${post.id}`);
      } catch (err) {
        await prisma.scheduledPost.update({
          where: { id: scheduled.id },
          data: {
            status: 'failed',
            errorMessage: err.message,
          },
        });
        console.error(`❌ Failed to publish scheduled post ${scheduled.id}:`, err.message);
      }
    }

    if (duePosts.length > 0) {
      console.log(`📬 Processed ${duePosts.length} scheduled post(s)`);
    }
  } catch (err) {
    console.error('❌ Scheduler error:', err.message);
  }
}

export function startScheduler() {
  // Run every minute
  cron.schedule('* * * * *', publishScheduledPosts);
  console.log('✅ Cron scheduler started (checking scheduled posts every minute)');

  // Purge soft-deleted products every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await productService.purgeExpiredProducts({ take: 25 });
      if (result.total > 0) {
        console.log(`🧹 Product purge run: total=${result.total}, purged=${result.purged}, failed=${result.failed}`);
      }
    } catch (error) {
      console.error('❌ Product purge scheduler error:', error.message);
    }
  });
}
