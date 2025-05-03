import { Request, Response, Router } from "express";

import { logger } from "../util/logger";
import { Prisma, PrismaClient, Role } from '@prisma/client'
import { checkAdmin, sign } from "./middleware/authentication-middleware";
import util from 'util'

import AuthService  from "../service/auth-service";
import UserService from "../service/user-service";


/*
    This Auth class is based on recommendations from OWASP
    https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
*/
export class Auth {

    public router: Router;

    private prisma: PrismaClient;
    private userService: UserService;


    constructor() {
        this.router = Router();
        this.addRoutes();
        this.prisma = new PrismaClient();
        this.userService = UserService.getInstance();
    }

    private addRoutes() {
        this.router.get('/', checkAdmin, this.getAllUsers);
        this.router.get('/:username', checkAdmin, this.getUserByName);
        this.router.post('/login', this.login);
        this.router.post('/signup', this.signup);
        this.router.post('/reset', checkAdmin, this.resetPassword);
        this.router.post('/promote', checkAdmin, this.promoteUser);
    }

  
    private login = async (req: Request, res: Response) => {
       const { username, password } = req.body;

        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: {
                username: username
            }
        });

        /*
            Do not early return and perform normal procedure to avoid timing attacks,
            even with known bad credentials
        */
        const hashedPassword = await AuthService.performScrypt(AuthService.credentialsGuard(password), user?.salt ?? '');
        const pepperedHash = await AuthService.addPepper(hashedPassword);

        const userResponse = { username: user?.username, role: user?.role }; 
        const singedResponseToken = await sign(userResponse);
        
        if(pepperedHash === user?.passwordHash) {
            logger.info(`User ${username} logged in`);
            res.status(200).send({status: 'success', token: singedResponseToken});
        } else {
            logger.error(`User ${username} failed to log in`);
            res.status(401).send({status: 'Username or password incorrect'});
        }
    }

    /**
     * Handles the signup functionality.
     * 
     * @param {Request} req - The request object.
     * @param {string} req.username - username.
     * @param {string} req.password - password.
     * @param {Response} res - The response object.
     * @returns {{username: string}} - username - if creation is successfull.
     */
    private signup = async (req: Request, res: Response) => {
        const { username, password } = req.body;

        logger.info(`Creating user ${username}`);

        if(!(username || password)) {
            logger.error('Username and password required');
            res.status(400).send({error: 'Username and password required'});
            return;
        } 
        
        if(!AuthService.checkPasswordPolicy(password)) {
            logger.error('password policy not met');
            res.status(400).send({error: 'password policy not met', info: 'min length 10 characters, max length 64 characters'});
            return;
        } 
    
        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: {
                username: username
            }
        });

        if(user) {
            logger.error(`Username already exists ${username}`);
            res.status(400).send({error: 'Username already exists'});
            return;
        }

        const newUser = await this.userService.createUser(username, password);
        
        logger.info(`User created ${newUser.username}`);
        res.status(200).send({message: 'User created successfully', user: newUser.username});
    }

    private resetPassword = async (req: Request, res: Response) => {
        const { username, password } = req.body;

        logger.info(`Resetting password for user ${username}`);

        if(!(username || password)) {
            logger.error('Username and password required');
            res.status(400).send({error: 'Username and password required'});
            return;
        } 
        
        if(!AuthService.checkPasswordPolicy(password)) {
            logger.error('password policy not met');
            res.status(400).send({error: 'password policy not met', info: 'min length 10 characters, max length 64 characters'});
            return;
        } 
    
        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: {
                username: username
            }
        });

        if(!user) {
            logger.error(`Username does not exist ${username}`);
            res.status(400).send({error: 'Username does not exist'});
            return;
        }
        
        const { pepperedHash, salt } = await AuthService.createCryptedPassword(password);

        const updatedUser = await this.userService.updateUser(user.userId,{
            passwordHash: pepperedHash,
            salt: salt,
            algorithm: 'SCRYPT',
            role: user.role
        });
        
        logger.info(`User password reset ${updatedUser.username}`);
        res.status(200).send({message: 'User password reset successfully', user: updatedUser.username});
    }


    private promoteUser = async (req: Request, res: Response) => {
        const { username, role } = req.body;

        logger.info(`Promoting user ${username} to ${role}`);


        //check if role is valid
        if(Role[role as keyof typeof Role] === undefined) {
            logger.info(`Role does not exist ${role}`);
            res.status(400).send({error: 'Role does not exist'});
            return;
        }


        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: {
                username: username
            }
        });

        if(!user) {
            logger.error(`Username does not exist ${username}`);
            res.status(400).send({error: 'Username does not exist'});
            return;
        }

        const updatedUser = await this.userService.updateUser(user.userId,{
            role: role
        }).catch((err) => {
            logger.error(`${util.inspect(err, {showHidden: false, depth: null})}`);
        });
        
        if(!updatedUser) {
            logger.error(`User ${username} could not be promoted`);
            return res.status(500).send({error: 'Internal server error'});
        }


        logger.info(`User ${updatedUser.username} promoted to ${role}`);
        res.status(200).send({message: 'User promoted successfully', user: updatedUser.username , role: updatedUser.role});
    }


    
    private getAllUsers = async (req: Request, res: Response) => {
        const users = await this.prisma.user.findMany({
            select: {
                userId: true,
                username: true,
                role: true
            }
        });
        res.status(200).send(users);
    }

    private getUserByName = async (req: Request, res: Response) => {
        const username = req.params.username;

        const user = await this.prisma.user.findUnique({
            select: {
                userId: true,
                username: true,
                role: true
            },
            where: {
                username: username
            }
        }).catch((err) => {
           logger.error(`${util.inspect(err, {showHidden: false, depth: null})}`);
           return res.status(500).send({error: 'Internal server error'});
        });

        res.status(200).send(user);
    }

}

export default Auth;
