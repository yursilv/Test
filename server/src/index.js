const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const seed = require('./db-seeds');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(async () => {
  logger.info('Connected to MongoDB');
  if (config.env === 'development') {
    await seed();
    logger.info(`Seeds applied`);
  }
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
