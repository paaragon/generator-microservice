import config from 'config';
import { ConnectionOptions, createConnection } from 'typeorm';
import { TypeOrmLogger } from '../lib/typeormlogger/TypeOrmLogger';
import { logger } from '../logger/logger';
import { ConfigLogI, ConfigSQLiteI } from '../models/ConfigI';

const dbConfig = config.get<ConfigSQLiteI>('db');
const logConfig = config.get<ConfigLogI>('log');

const options: ConnectionOptions = {
    name: 'default',
    <% if (database === 'sqlite') { %>
    type: 'sqlite',
    database: dbConfig.location,
    <% } else if (database === 'oracle') { %>
    type: 'oracle',
    connectString: dbConfig.connectionString, // this is an option. You can configure it also with host, port and database properties
    username: dbConfig.user,
    password: dbConfig.password,
    extra: {
        poolMax: dbConfig.maxConnections
    },
    <% } else if (database === 'postgresql') { %>
    type: 'postgres',
    database: dbConfig.db,
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.user,
    password: dbConfig.password,
    ssl: {
        rejectUnauthorized: false
    },
    extra: {
        max: dbConfig.maxConnections,
    },
    <% } %>
    synchronize: true,
    logger: new TypeOrmLogger(),
    maxQueryExecutionTime: dbConfig.queryAlertTime,
    logging: logConfig.level === 'debug',
    entities: [
        `${__dirname}/../models/dbentities/*.ts`,
        `${__dirname}/../../dist/**/models/dbentities/*.js`,
    ],
};

export default {
    createConnection: async () => {
        logger.info(`${JSON.stringify(options)}`)
        await createConnection(options);
    }
}