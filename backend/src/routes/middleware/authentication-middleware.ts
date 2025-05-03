import jwt from 'jsonwebtoken';
import { Response, Request } from 'express';
import { PRIVATE_KEY, PUBLIC_KEY } from '../../secrets';
import { Role } from '@prisma/client';
import { logger } from '../../util/logger';
import { log } from 'console';


export interface TokenContent {
    username: string;
    role: Role;
    iat: number;
}
export interface AuthenticatedRequest extends Request {
    user?: TokenContent
}

export function sign(token: string | object): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign(token, PRIVATE_KEY, { algorithm: 'RS256' }, (error, token) => {
            if (error || token === undefined) {
                reject(error);
            } else {
                resolve(token);
            }
        });
    });

}

export const checkUser = (reqeust: AuthenticatedRequest, response: Response, next: Function) => {
    const { user } = reqeust;

    if (user === undefined || !([ Role.USER, Role.ADMIN ].includes(user.role))) {
        logger.info("request rejected, user has not at least user role")
        return response.status(401).json({
            error: 'Unauthorized!'
        });
    }

    next()
}

export const checkAdmin = (reqeust: AuthenticatedRequest, response: Response, next: Function) => {
    const { user } = reqeust;

    if (user === undefined || Role.ADMIN !== user.role) {
        logger.info("request rejected, user has not at least admin role")
        return response.status(401).json({
            error: 'Unauthorized!'
        });
    }

    next()
}

const authenticate = async (reqeust: AuthenticatedRequest, response: Response, next: Function) => {
    const { authorization } = reqeust.headers;

    if (authorization === undefined) {
        logger.info("No Authentication header.")
        return next();
    }

    try {
        const decoded = jwt.verify(authorization, PUBLIC_KEY) as TokenContent;
        reqeust.user = decoded;
        logger.info(`User ${decoded.username} successfully authenticated as ${decoded.role}`)
        next();
    } catch (error) {
        logger.info("failed decoding jwt. Rejecting request as unauthorized.")
        response.status(401).json({
           error: 'Unauthorized!'
        });
    }

}


export default authenticate