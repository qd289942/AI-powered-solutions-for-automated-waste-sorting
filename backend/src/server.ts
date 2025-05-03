import express from 'express';
import https from 'node:https';
import http from 'node:http';

import {logger} from './util/logger';
import {Server as IOServer} from 'socket.io';
import {EventEmitter} from "node:events";
import {Events} from './data/events';

import bodyParser from 'body-parser';
import cors from 'cors';
import { Actuator, OperationSection, PrismaClient } from '@prisma/client';
import DetectedObject from './data/detected-object';
import authenticate from './routes/middleware/authentication-middleware';

type TrashDetectedData = { operationSection: OperationSection } & {predictions: DetectedObject[] } & { requestIncomingTime: number }
type ActuatorWithOperatoinSection = Actuator & { operationSection: OperationSection }
export class Server {

    private app: express.Application;
    private httpServer: http.Server | https.Server;
    private port: number;
    private io: IOServer;
    private trashDetectionEmitter: EventEmitter[];
    private prisma: PrismaClient;

    constructor(port: number, publicKey: string, privateKey: string, tlsEnabled: boolean) {
        this.port = port;

        // Create the express app and the http(s) server
        this.app = express();

        if (!tlsEnabled) {
            this.httpServer = http.createServer(this.app);
        } else {
            const options = {
                key: privateKey,
                cert: publicKey
            };
            this.httpServer = https.createServer(options, this.app);
        }

        this.trashDetectionEmitter = new Array<EventEmitter>();
        // add middleware to parse the body of the request
        this.addMiddleware(bodyParser.json());
        this.addMiddleware(bodyParser.urlencoded({ extended: true }));
        this.addMiddleware(cors());
        this.addMiddleware(authenticate);

        // Create the socket.io server
        this.io = new IOServer(this.httpServer);
        this.initSocketIO();

        //initialize prisma client
        this.prisma = new PrismaClient()
        
    }

    private initSocketIO() {
        this.io.on(Events.CONNECTION, (socket) => {
            logger.info(`Client connected: ${socket.id}`);

            socket.on(Events.DISCONNECT, () => {
                logger.info(`Client disconnected: ${socket.id}`);
            });

            this.trashDetectionEmitter.forEach(emitter => {

                logger.info(`Adding trash detection emitter`);
                emitter.on(Events.TRASH_DETECTED, async (data: TrashDetectedData) => {
                
                    const actuators: ActuatorWithOperatoinSection[] = await this.prisma.actuator.findMany({
                        where: {
                            operationSectionId: data.operationSection.operationSectionId
                        },
                        include: {
                            operationSection: {}
                        }
                    })
                
                    data.predictions.forEach((prediction: DetectedObject) => {
                        actuators.forEach((actuator: ActuatorWithOperatoinSection): void => {

                            try {

                                const delayInMS = this.calculateAcuatorDelayMS(actuator, data.requestIncomingTime, prediction)

                                //typescript check
                                if(actuator.activationTrashLabel === undefined)
                                    return;

                                //typescript check
                                if(!Array.isArray(actuator.activationTrashLabel))
                                    return;

                                if(actuator.activationTrashLabel.find((label) => label === prediction.predictionClass) !== undefined) {
                                    logger.info(`informing actuator ${actuator.actuatorId} about trash ${prediction.predictionClass} in ${delayInMS} ms`)

                                    setTimeout(() => {
                                        logger.info(`informing actuator ${actuator.actuatorId} about trash ${prediction.predictionClass}`);
                                        socket.emit(`${Events.TRASH_DETECTED}/${actuator.actuatorId}`, prediction);
                                    }, delayInMS)
                                    
                                }
                            } catch(e) {

                            }
                        })
                    })
                    
                    // backwards compatibility
                    socket.emit(Events.TRASH_DETECTED, data);
                });
            });
        });
    }

    private calculateAcuatorDelayMS = (actuatorWithOperatoinSection: ActuatorWithOperatoinSection, requestIncomingTime: number, prediction: DetectedObject): number => {
        const cameraDistance = + actuatorWithOperatoinSection.cameraDistance                                    // Distance to the Camera in mm
        const conveyerSpeed = + actuatorWithOperatoinSection.operationSection.conveyerSpeed                     // Speed in mm/min
        const actuatorCalibration = + actuatorWithOperatoinSection.actuatorCalibration                          // Calibration in ms
        const cameraPictureWidthMm = + actuatorWithOperatoinSection.operationSection.cameraPictureWidthMm       // Width of the camera picture in mm
        
       
        if(prediction.imageWidth === undefined) { 
            logger.warn(`Image width is not set in prediction`)
            throw new Error(`Image width is not set in prediction`)
        }
            
 
        const imageWidth = + prediction.imageWidth

        /*
        * 1. Calculate the ratio of the camera picture width in mm to the image width in pixels


        --------------------
        |     ____         |
        |    |____|        |
        |                  |
        --------------------


        */

        const xRatio = cameraPictureWidthMm / imageWidth
        const objectCenter = prediction.x() + prediction.width() / 2
        const viewCenter = imageWidth / 2

        /*
        *  The Center Distance might be positive or negative.
        *  If the object is on the right side of the image, the center distance is positive
        *  If the object is on the left side of the image, the center distance is negative
        */ 
        const centerDistance = viewCenter - objectCenter

        // Calculate the correction factor, which is the distance the object is off the center in mm
        // The correction factor is the center distance in px multiplied by the xRatio
        const correctionFactor = centerDistance * xRatio

        logger.debug(`Center Distance: ${centerDistance} px, Correction Factor: ${correctionFactor} mm, xRatio: ${xRatio}, Object Center: ${objectCenter} px, View Center: ${viewCenter} px`)

        // conver conver speed into mm/ms
        // 1 min == 60s * 1000ms => 60 000 ms
        const conveyerSpeedMMMS = conveyerSpeed / 60000.0;
        	
        // time the process has taken from incoming request to now...
        const porcessTime = Date.now() - requestIncomingTime

        logger.info(`Camera Distance: ${cameraDistance} mm, CorrectionFactor ${correctionFactor} mm, Conveyer Speed: ${conveyerSpeed} mm/min, Actuator Calibration: ${actuatorCalibration} ms`)

        const timeDelayWithoutCorrection = cameraDistance / conveyerSpeedMMMS - porcessTime + actuatorCalibration;
        const timeDelay = ((cameraDistance + correctionFactor) / conveyerSpeedMMMS) - porcessTime + actuatorCalibration;

        logger.info(`Time Delay: ${timeDelay} ms`)
        logger.info(`Time Delay Without Correction: ${timeDelayWithoutCorrection} ms`)

        if(timeDelay < 0) {
            logger.warn(`Process has taken to long to inform Actuator ${actuatorWithOperatoinSection.actuatorId}`)
            throw new Error(`Process has taken to long to inform Actuator ${actuatorWithOperatoinSection.actuatorId}`)
        }

       return timeDelay

    }

    public addRoute(path: string, router: express.Router) {
        this.app.use(path, router);
    }

    public addMiddleware(middleware: express.RequestHandler) {
        this.app.use(middleware);
    }

    public serveStaticFiles(path: string) {
        this.app.use(express.static(path));
    }

    public addTrashDetectionEmitter(emitter: EventEmitter) {
        this.trashDetectionEmitter.push(emitter);
    }

    public start() {
        this.httpServer.listen(this.port, () => {
            logger.info(`Server is running on port ${this.port}`);
        });
    }
}
