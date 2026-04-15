import { createServer } from "http";
import app from "./app.js";
import { initSocket } from "./config/socket.js";
import { startScheduler } from "./jobs/scheduler.js";
import { validateEnv } from "./config/env.js";
import { logInfo } from "./utils/logger.js";

const PORT = process.env.PORT || 5000;
validateEnv();

const httpServer = createServer(app);

initSocket(httpServer);

startScheduler();

httpServer.listen(PORT, () => {
    const environment = process.env.NODE_ENV || "development";
    logInfo("Server started", {
        port: PORT,
        environment,
        apiUrl: `http://localhost:${PORT}/api`,
        websocketUrl: `ws://localhost:${PORT}`,
    });
});
