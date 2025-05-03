import { logger } from "./util/logger";
import fs from 'fs';    

const PUBLIC_KEY_PATH  = process.env.PUBLIC_KEY  ?? './secrets/server.crt';
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY ?? './secrets/server.key';

logger.info(`Using public key: ${PUBLIC_KEY_PATH}`);

//Loading Keys
export const PUBLIC_KEY = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
export const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');