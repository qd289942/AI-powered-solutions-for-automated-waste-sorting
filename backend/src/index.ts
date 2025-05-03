import IArtificialIntelligence from "./artifical-intelligence/iartifical-intelligence";
import Auth from "./routes/auth";
import ObjectDetectionRouter from "./routes/object-detection";
import { Server } from "./server";
import { logger } from "./util/logger";
import { PUBLIC_KEY, PRIVATE_KEY } from "./secrets";
import CocoSSD from "./artifical-intelligence/cocossd";
import DectectedObjectsModel from './service/dectected-objects-model';
import { Client } from '@elastic/elasticsearch';
import YoloV8 from "./artifical-intelligence/yolov8";
import UserService from "./service/user-service";
import { OperationSectionRouter } from "./routes/operation-sections";
import primsaConnection from "../prisma/Prisma";
import { Prisma, Role } from "@prisma/client";
import YoloV8Remote from "./artifical-intelligence/yolov8-remote";
import {AiRouter} from './routes/ai-router';

const PORT = + (process.env.PORT ?? 3000);
const ELASTIC_HOST = process.env.ELASIC_HOST ?? "http://127.0.0.1:9200";
const TLS_MODE_ENABLED = process.env.TLS_MODE ? process.env.TLS_MODE.toLowerCase() === 'true' : false;
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD
const DEFAULT_USER_USERNAME = process.env.DEFAULT_USER_USERNAME
const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD


/*
*   Seeding Database with default admin. Admin-User will only be created if not alredy exists.
*/
if (DEFAULT_ADMIN_PASSWORD && DEFAULT_ADMIN_USERNAME){
    UserService.getInstance().seed(
        DEFAULT_ADMIN_USERNAME,
        DEFAULT_ADMIN_PASSWORD,
        Role.ADMIN 
    );    
}

if (DEFAULT_USER_USERNAME && DEFAULT_USER_PASSWORD){
    UserService.getInstance().seed(
        DEFAULT_USER_USERNAME,
        DEFAULT_USER_PASSWORD,
        Role.USER
    );    
}

async function init() {
    
logger.info(`Starting server on port ${PORT}`);

if(TLS_MODE_ENABLED) {
    logger.info(`TLS mode enabled`);
    logger.info(`Using public key: ${PUBLIC_KEY}`);
} else {
    logger.info(`TLS mode disabled, using plain http`);
    logger.info(`Note: This mode is only for development or for production if TLS termination is done elsewhere (for example using a reverse proxy or load balancer)`);
    logger.warn(`Do not use this software without TLS as security is at risk`);
}

const elasticClient = new DectectedObjectsModel(new Client({node: ELASTIC_HOST}));
const coco: IArtificialIntelligence = new CocoSSD();
const yolo: IArtificialIntelligence = new YoloV8('detection_web_model');
const yoloRemote: IArtificialIntelligence = new YoloV8Remote(
        'http://localhost:8080/detect',
        'http://localhost:8080/status',
        "YoloV8_detection_v3_remote"
    );


// check if AIs have already been registered to Database
const cocoDBInput: Prisma.ArtificialIntelligenceCreateInput = {
    "name": coco.displayName,
    "detectionLabels": coco.getDetectionCapabilities()
}

const yoloDBInput: Prisma.ArtificialIntelligenceCreateInput = {
    "name": yolo.displayName,
    "detectionLabels": yolo.getDetectionCapabilities()
}
const yoloRemoteDBInput: Prisma.ArtificialIntelligenceCreateInput = {
    "name": yoloRemote.displayName,
    "detectionLabels": yolo.getDetectionCapabilities()
}



// insert ais if they don't exist
await primsaConnection.artificialIntelligence.upsert({
        where: {
         name: coco.displayName
        },
        update: {},
        create: cocoDBInput
    }
)

await primsaConnection.artificialIntelligence.upsert({
    where: {
     name: yolo.displayName
    },
    update: {},
    create: yoloDBInput
})

await primsaConnection.artificialIntelligence.upsert({
    where: {
     name: yoloRemote.displayName
    },
    update: {},
    create: yoloRemoteDBInput
})

const ais = await primsaConnection.artificialIntelligence.findMany();

//setting aiIds for for current models
coco.aiId = ais.find(ai => ai.name === coco.displayName)?.aiId
yolo.aiId = ais.find(ai => ai.name === yolo.displayName)?.aiId
yoloRemote.aiId = ais.find(ai => ai.name === yoloRemote.displayName)?.aiId

const authenticationRouter = new Auth();
const objectDetectionRouter = new ObjectDetectionRouter([coco, yolo, yoloRemote], elasticClient);
const operationSectionRouter = new OperationSectionRouter();
const aiRouter = new AiRouter();

//Creating Primsa Client
const server = new Server(PORT, PUBLIC_KEY, PRIVATE_KEY, TLS_MODE_ENABLED);

server.addRoute("/auth", authenticationRouter.router);
server.addRoute("/object-detection", objectDetectionRouter.router)
server.addRoute("/operation-sections", operationSectionRouter.router)
server.addRoute("/ai", aiRouter.router)
server.addTrashDetectionEmitter(objectDetectionRouter.trashDetectionEmittor);

server.serveStaticFiles('public');
logger.info('Serving static files from public folder');
server.start();

logger.info('Server started');

}

init()

