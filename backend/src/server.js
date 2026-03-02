import { createServer } from 'http';
import app from './app.js';
import { initSocket } from './config/socket.js';
import { startScheduler } from './jobs/scheduler.js';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

initSocket(httpServer);

startScheduler();

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});
