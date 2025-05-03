import { PrismaClient, User, Role, Prisma } from '@prisma/client'

import AuthService from "./auth-service";
import { logger } from '../util/logger';


export default class UserService {

    private prisma: PrismaClient;

    private static userService: UserService;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public static getInstance(): UserService {

        if(!UserService.userService) {
            UserService.userService = new UserService();
        } 

        return UserService.userService;
        
    }

    private async createMember(username: string, password: string, role: Role): Promise<User> {
        const { pepperedHash, salt } = await AuthService.createCryptedPassword(password);

        // Create user
        const newUser = await this.prisma.user.create({
            data: {
                username: username,
                passwordHash: pepperedHash,
                salt,
                algorithm: 'SCRYPT',
                role: role
            }
        });

        return newUser;
    }

    public async createUser(username: string, password: string): Promise<User> {

        return this.createMember(username, password, Role.USER);
    }

    public async createAdmin(username: string, password: string): Promise<User> {
        return this.createMember(username, password, Role.ADMIN);
    }

    public async getUser(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: {
                username: username
            }
        });
    }

    public async deleteUser(username: string): Promise<User | null> { 
        return this.prisma.user.delete({
            where: {
                username: username
            }
        });
    }

    public async updateUser(userId: number, user: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: {
                userId: userId
            },
            data: user
        });
    }

    public async seed(username: string, password: string, role: Role): Promise<void> {
        logger.info("trying to seed database");

        const user = await this.getUser(username)

        if(user) {
            logger.info("Default user has already been created!")
            return;
        }

        try {
            
            if(role === Role.ADMIN) {
                this.createAdmin(username, password);
            } else{
                this.createUser(username, password);
            }
            
            logger.info(`default ${role} ${username} has successfully been created!`);

        } catch (error) {
            logger.error(error)
        }
    }
}


