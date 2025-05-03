
import { Request, Response, Router } from "express";
import IArtificialIntelligence from "../artifical-intelligence/iartifical-intelligence";
import multer from "multer";
import { EventEmitter } from "node:events";
import util from 'util'

import DectectedObjectsModel from '../service/dectected-objects-model';

import { logger } from "../util/logger";
import DetectedObject from "../data/detected-object";
import { OperationSection, PrismaClient } from "@prisma/client";

import {ObjectTracker} from '../object-tracking/object-tracker';
import path from 'path';
import * as crypto from 'node:crypto';
import fs from 'fs'
import { checkUser } from "./middleware/authentication-middleware";
import Archiver from 'archiver';

import * as imageSize from 'image-size';

/*

    This is the route that will be used to handle object detection requests.
    The route will be mounted at /object-detection

*/

export class ObjectDetectionRouter {
    
    public router: Router;
    private ais!: IArtificialIntelligence[];
    private aiIds!: number[];
    private detectedObjectsModel: DectectedObjectsModel;
    private prisma: PrismaClient
    public trashDetectionEmittor: EventEmitter;

    private objectTrackers: {[operationSectionId: number]: ObjectTracker} = {};

    constructor(ais: IArtificialIntelligence | IArtificialIntelligence[], elasticClient: DectectedObjectsModel) {
        this.router = Router();
        this.setArtificialIntelligence(ais);
        this.detectedObjectsModel = elasticClient;
        this.prisma = new PrismaClient()
        this.trashDetectionEmittor = new EventEmitter();
        this.addRoutes();
    }

    public setArtificialIntelligence(ais: IArtificialIntelligence | IArtificialIntelligence[]) {
        // If only one AI is provided, convert it to an array
        if(!Array.isArray(ais)) {
            ais = [ais];
        }
        this.ais = ais;
        this.updateAiIds()
    }

    private updateAiIds = () => {
        this.aiIds = []
        this.ais.map(ai => { if(ai.aiId) this.aiIds?.push(ai.aiId) })
        
    }

    private addRoutes() {

        const storage = multer.memoryStorage()
        const upload = multer({ storage: storage })

        this.router.post('/detect/:id', checkUser, upload.single('image_file'), this.postDetectWithoutNotification);
        this.router.post('/detect/', checkUser, upload.single('image_file'), this.postDetectWithNotification);
        this.router.get("/list", (req, res) => this.getDetectedObjects(req, res));
        this.router.get("/get/:id", async (req, res) => {
            const data = await this.detectedObjectsModel.get(req.params.id).catch(e => {
                logger.error(`Error getting detected objects: ${e}`);
                return res.json([])
            })
            res.json(data);
        });
        this.router.get("/downloadImages/:id", async (req, res) => this.downloadZip(req, res));
        this.router.get('/', (req, res) => {
            const buildResponse = this.ais.map((ai) => { 

                return {
                    "aiName": ai.displayName,
                    "aiIndex": ai.aiId
                }
                 
            });
            res.send(buildResponse);
        })
    }

    private async downloadZip(req: Request, res: Response) {
        const trackingId = req.params.id;
        const imagePaths = await this.getTrackedObjectImagePaths(trackingId);

        await this.createForceZipDownload(res, 'images', imagePaths);
    }

    private async createForceZipDownload(res: Response, filename: string, paths: string[]) {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.zip`);

        const archive = Archiver('zip', {
            zlib: { level: 9 } // Sets the compression level
        });

        archive.on('error', (err: any) => {
            throw err;
        });

        // Pipe the archive to the response
        archive.pipe(res);

        // Append each image to the zip
        paths.forEach((filePath) => {
            const fileName = path.basename(filePath); // Extract the file name from the path
            archive.file(filePath, { name: fileName });
        });

        // Finalize the archive (i.e. we are done appending files but streams have to finish yet)
        await archive.finalize();
    }

    private async getTrackedObjectImagePaths(trackingId: string) {
        const trackedObjectDetailedSummary = await this.detectedObjectsModel.get(trackingId);
        const singleDetections = trackedObjectDetailedSummary.top_hits_docs.hits.hits as {_source: {img_path: string}}[];

        const imagePaths: string[] = [];

        singleDetections.forEach(detectedObject => {
            imagePaths.push('public' + detectedObject._source.img_path);
        });

        return imagePaths;
    }

    private async getDetectedObjects(req: any, res: any) {
        const page = +(req.query['page'] ?? 1);
        const perPage = +(req.query['perPage'] ?? 30);
        try {
            const data = await this.detectedObjectsModel.page(page, perPage)
            
            res.json(data);    
        } catch (error) {
            logger.error(`Error getting detected objects: ${error}`);
            res.json([])
        }
        
    }

    /**
     * Handles the POST request for object detection without notification.
     * 
     * @param req - The Express Request object.
     * @param {number} req.params.id - The index of the AI to use.
     * @param {Express.Multer.File} req.file - The image file to detect objects in. Must have the field name 'image_file'.
     */
    private postDetectWithoutNotification = async (req: Request, res: Response) => {
        let aiIndex: number = + req.params.id;

        if(aiIndex === undefined){
            aiIndex = this.aiIds[0]
        }
            
        try {
            
            const predictions = await this.detect(req, aiIndex);         
            res.json(predictions);

        } catch(e) {

            if(e instanceof Error)
               return res.status(400).send({error: e.message});

            return res.status(500).send({error: "Internal Server error!"});

        }

    }

    private createObjectTrackerIfNotExists(operationSectionId: number) {
        if(!this.objectTrackers.hasOwnProperty(operationSectionId)){
            this.objectTrackers[operationSectionId] = new ObjectTracker();
        }
    }

    private saveImageFile(file: Express.Multer.File, targetDir: string) {
        const randomName = crypto.randomBytes(16).toString('hex');
        const fileExtension = path.extname(file.originalname);
        const randomFileName = `${randomName}${fileExtension}`;
        const savePath = path.join(targetDir, randomFileName);

        fs.writeFileSync(savePath, file.buffer);

        return path.join(savePath);
    }

    private runObjectTracking(operationSection: OperationSection, predictions: DetectedObject[], image: Express.Multer.File, detectionTime: number) {
        const { operationSectionId } = operationSection
        this.createObjectTrackerIfNotExists(operationSectionId);
        const identificationResults = this.objectTrackers[operationSectionId].identifyObjects(predictions);

        for (let i = 0; i < predictions.length; i++) {
            const objectReIdentificationResult = identificationResults[i];

            let savePath = this.saveImageFile(image, 'public/images');
            savePath = savePath.replace('public', '');

            if(!objectReIdentificationResult.reIdentified) {
                // Send notification to actuator
                this.notifyActuator(predictions, operationSection, detectionTime);
            } else {
                logger.warn(`Object reidentified, do not send notification to actuator.`);
            }

            // Neu erkannte Objekte in der Datenbank speichern
            this.detectedObjectsModel.save(predictions[i], detectionTime, savePath, objectReIdentificationResult.id, operationSection);
        }
    }

    /**
     * Handles the POST request for object detection with actuator notification.
     * 
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {number} req.body.operationSectionId - The id of the operation section to use.
     * @param {Express.Multer.File} req.file - The image file to detect objects in. Must have the field name 'image_file'.
     * @returns {DetectedObject[]} predictions - The predictions made by the AI.
     */
    private postDetectWithNotification = async (req: Request, res: Response) =>  {
       
            const requestIncomingTime = Date.now();
            const operationSectionId = + req.body.operationSectionId;

            logger.info(`incoming detection request with oeprationSectionId: ${operationSectionId}`)

            if(isNaN(operationSectionId) || operationSectionId === undefined) {
                logger.info(`Invalid Operation Section Id: ${operationSectionId}`)
                return res.status(400).send({error: "Invalid Operation Section Id"})
            }

            //query ai to use based on operationSectionId
            const operationSection = await this.prisma.operationSection.findUnique({
                where: {
                    operationSectionId
                }
            })

            if(operationSection === null) {
                logger.info(`Invalid Operation Section Id: ${operationSectionId}`)
                return res.status(404).send({error: `Operation Section not found!`})
            }
            
            let aiIndex: number;

            // using a default aiId due to backwards compatibility
            if(operationSection?.aiId === undefined) {
                aiIndex = this.aiIds[0]
            } else {
                aiIndex = + operationSection.aiId
            }

            try {
                const predictions = await this.detect(req, aiIndex);
                res.json(predictions);
                logger.info(`predictions: ${JSON.stringify(predictions)}`)
                // check if predictions exceed camera x threshold
                const predictionsWithRequiredCameraXThreshold = await this.checkCameraXThreshold(predictions, operationSection);
                const predictionsWithRequiredDetectionMinThreshold = await this.checkPredictionMinThreshold(predictionsWithRequiredCameraXThreshold, operationSection);
                this.runObjectTracking(operationSection, predictionsWithRequiredDetectionMinThreshold, req.file as Express.Multer.File, requestIncomingTime);

            } catch(e) {

                if(e instanceof Error) {
                    logger.info(`Invalid Operation Section Id: ${operationSectionId}`)
                    return res.status(400).send({error: e.message});
                }

                logger.error(`${util.inspect(e, {showHidden: false, depth: null})}`)
                return res.status(500).send({error: "Internal Server error!"});

            }
   
    }

    /**
     * Detects objects in an image using the specified AI model.
     * 
     * @param req - The request object containing the image file.
     * @param aiIndex - The index of the AI model to use for object detection.
     * @returns A promise that resolves to an array of detected objects.
     * @throws An error if no image is provided or if the AI index is invalid.
     */
    private detect = async (req: Request, aiIndex: number): Promise<DetectedObject[]> => {

        const image = req.file as Express.Multer.File;
        logger.info(`detecting objects in image with aiIndex: ${aiIndex}`)

        if(!image) {
            throw new Error('No image provided');
        }
        
        if(!(this.aiIds?.find(id => id === aiIndex))) {
            throw new Error(`Invalid AI index! Must be in ${JSON.stringify(this.aiIds)}`);
        }

        const ai = this.ais.find(ai => ai.aiId === aiIndex) as IArtificialIntelligence
        const dimensions = imageSize.imageSize(image.buffer)
        const uint8Array = new Uint8Array(image.buffer);
        const predictions = await ai.detectImage(uint8Array);
     
        return predictions.map(prediction => {
            prediction.imageWidth = dimensions.width;
            return prediction;
        });
    }

    /**
     * Filters the given array of detected objects based on the camera X threshold.
     * @param predictions - The array of detected objects.
     * @param operationSection - The operation section containing the camera X threshold.
     * @returns A promise that resolves to an array of detected objects that exceed the camera X threshold.
     */
    private checkCameraXThreshold = async (predictions: DetectedObject[], operationSection: OperationSection): Promise<DetectedObject[]> => {
        const predictionsWithRequiredCameraXThreshold = predictions.filter(prediction => {
            
            if((+ prediction.x()) > (+ operationSection.cameraXThreshold)) {
                return true;
            } else {
                logger.info(`prediction ${prediction.predictionClass} did not exeed cameraXThreshold ${operationSection.cameraXThreshold} with ${prediction.x()}`)
            }
            
        });

        // no prediction exceeds camera x Threshold
        if(!predictionsWithRequiredCameraXThreshold || predictionsWithRequiredCameraXThreshold.length == 0)
            return [];


        return predictionsWithRequiredCameraXThreshold
    }

    /**
     * Filters out predictions that do not exceed the specified detection minimum threshold.
     * @param predictions - The array of detected objects.
     * @param operationSection - The operation section containing the detection minimum threshold.
     * @returns An array of detected objects that exceed the detection minimum threshold.
     */
    private checkPredictionMinThreshold = async (predictions: DetectedObject[], operationSection: OperationSection): Promise<DetectedObject[]> => {
        const predictionsWithRequiredDetectionMinThreshold = predictions.filter(prediction => {
            
            if((+ prediction.predictionScore) > (+ operationSection.detectionMinThreshold)) {
                return true;
            } else {
                logger.info(`prediction ${prediction.predictionClass} did not exeed detectionMinThreshold ${operationSection.detectionMinThreshold} with ${prediction.predictionScore}`)
            }
            
        });

        // no prediction exceeds detectionMinThreshold
        if(!predictionsWithRequiredDetectionMinThreshold || predictionsWithRequiredDetectionMinThreshold.length == 0)
            return [];


        return predictionsWithRequiredDetectionMinThreshold
    }

    /**
     * Notifies the actuator about the detected objects.
     * 
     * @param {DetectedObject[]} predictions - The array of detected objects.
     * @param {OperationSection} operationSection - The operation section.
     * @param {number} requestIncomingTime - The time when the request was received.
     * @returns {Promise<void>} A promise that resolves when the notification is sent.
     */
    private notifyActuator = async (predictions: DetectedObject[], operationSection: OperationSection, requestIncomingTime: number): Promise<void> => {

 
        this.trashDetectionEmittor.emit('trash_detected', {operationSection, predictions: predictions, requestIncomingTime});
    }
}


export default ObjectDetectionRouter;


