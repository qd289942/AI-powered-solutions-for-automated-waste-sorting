import { PrismaClient } from '@prisma/client';
import { logger } from '../src/util/logger';

logger.info("Creating shared primsa connection");
const primsaConnection = new PrismaClient();

export default primsaConnection;