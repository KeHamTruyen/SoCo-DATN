import http from 'http';
import app from './app.js';
import { initSocket } from './config/socket.js';
import { syncAllDueScheduledPosts } from './services/scheduled-post.service.js';

const PORT = process.env.PORT || 5000;
const SCHEDULED_POST_SYNC_INTERVAL_MS = parseInt(process.env.SCHEDULED_POST_SYNC_INTERVAL_MS || '60000', 10);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO: ws://localhost:${PORT}`);

  setInterval(async () => {
    try {
      const publishedCount = await syncAllDueScheduledPosts();
      if (publishedCount > 0) {
        console.log(`⏰ Scheduled posts published: ${publishedCount}`);
      }
    } catch (error) {
      console.error('Failed to sync scheduled posts:', error.message || error);
    }
  }, Math.max(SCHEDULED_POST_SYNC_INTERVAL_MS, 5000));

  console.log(`⏱️ Scheduled post sync started (${Math.max(SCHEDULED_POST_SYNC_INTERVAL_MS, 5000)}ms interval)`);
});
