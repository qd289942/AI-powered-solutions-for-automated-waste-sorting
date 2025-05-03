import {PrismaClient} from '@prisma/client';
import {Request, Response, Router} from 'express';

export class AiRouter {

    private prisma: PrismaClient;
    public router: Router;

    constructor() {
        this.prisma = new PrismaClient()
        this.router = Router()
        this.addRoutes()
    }

    private addRoutes = () => {
        this.router.get('/', this.getAll);
    }

    private getAll = async (req: Request, res: Response) => {
        const ais = await this.prisma.artificialIntelligence.findMany();

        return res.json(ais);
    }
}
