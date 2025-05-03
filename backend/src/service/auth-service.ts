import * as crypto from 'node:crypto'
import { scrypt } from "node:crypto";

export default class AuthService {


    private static pepperGuard(pepper: string | undefined): string {
        if(typeof pepper === 'string') {
            return pepper;
        } else {
            throw new Error('No pepper found');
        }
     
    }

    public static checkPasswordPolicy(password: string): boolean {
        return password.length >= 10 && password.length <= 64;
    }

    public static createSalt(): string {
        return crypto.randomBytes(16).toString('hex');
     }
 
    public static async performScrypt(password: string, salt: string): Promise<string> {
        return new Promise((resolve, reject) => {

            scrypt(password, salt, 64, (err, key) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(key.toString('hex'));
                }
            });
        });
    }

    public static async addPepper(scryptedPassword: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const pepper = AuthService.pepperGuard(process.env.PEPPER);
                const hmac = crypto.createHmac('sha256', pepper);
                hmac.update(scryptedPassword);
                const digest = hmac.digest('hex');
                resolve(digest);

            } catch(err) {
                reject(err);
            }   
        });

    }

    public static credentialsGuard(input: string | undefined): string {
        return input ?? 'default';
    }

    public static async createCryptedPassword(password: string): Promise<{ pepperedHash: string, salt: string }> {
        const salt = AuthService.createSalt();
        const passwordHash = await AuthService.performScrypt(password, salt);
        const pepperedHash = await AuthService.addPepper(passwordHash);
        return { pepperedHash, salt };
    }


}