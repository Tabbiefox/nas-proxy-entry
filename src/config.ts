/**
 * Consume .env variables and expose them in `process.env`
 */
import dotenv from 'dotenv';
dotenv.config();

/**
 * Load configuration JSONs from ./config and export them for global use
 */
export {
    config,
    IConfig,
    Iplist as IIPListConfig
} from 'node-config-ts';
