import cron from 'node-cron';
import prisma from '../config/database.js';

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
      include: { user: { select: { id: true, username: true } } },
    });

    for (const scheduled of duePosts) {
      try {
        const post = await prisma.post.create({
          data: {
            authorId: scheduled.userId,
            content: scheduled.content,
            mediaUrls: scheduled.mediaUrls,
            mediaType: scheduled.mediaType,
            productId: scheduled.productId,
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
            publishedAt: now,
          },
        });

        await prisma.scheduledPost.update({
          where: { id: scheduled.id },
          data: {
            status: 'published',
            publishedPostId: post.id,
          },
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
}
