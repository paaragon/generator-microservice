import config from 'config';
import dotenv from 'dotenv';
import 'reflect-metadata';
import Server from './api/server';
import { ConfigApiI } from './config';
import { logger } from './logger/logger';
<% if (database) { %>import dbConnector from './infrastructure/db-connector';<% } %>

dotenv.config();

const log = logger.child({ name: 'app.ts' });
log.info('Starting app...');

(async () => {
  try {
    const port = normalizePort(process.env.PORT, config.get<ConfigApiI>('api').port);
    <% if (database) { %>
    log.info('Connecting database...');
    await dbConnector.createConnection();
    log.info('Database connected');
    <% } %>
    log.info('Starting server...');
    const server = new Server(port);
    await server.start();
    log.info('Server started');

    log.info('application started');
  } catch (e) {
    log.error(e);
    process.exit(1);
  }
})();

function normalizePort(val: string, defaultVal: number): number {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return defaultVal;
  }

  if (port >= 0) {
    return port;
  }

  return defaultVal;
}
