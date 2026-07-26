const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config/config');

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`SRMS API running in ${config.env} mode on port ${config.port}`);
  });

  // Fail loudly on unhandled promise rejections instead of leaving the process in a bad state
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
