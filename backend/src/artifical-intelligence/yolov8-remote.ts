import { logger } from "../util/logger";
import DetectedObject from "../data/detected-object";
import IArtificialIntelligence from "./iartifical-intelligence";
import axios from "axios";

import FormData from 'form-data'


export default class YoloV8Remote implements IArtificialIntelligence {

    public displayName: string;
    public aiId?: number;
    private detectionRoute: string;
    private statusRoute: string;
    private modelReady: boolean = false;


    private labels: string[] = [];

    constructor(detectionRoute: string, statusRoute: string, modelName: string) {
        this.detectionRoute = detectionRoute;
        this.displayName = modelName;
        this.statusRoute = statusRoute;
        this.loadModel()
    }


    private loadModel = async () => {
        if(!this.modelReady) {
            
                try {
                    const res = await fetch(this.statusRoute)
                    if (res.status === 200) {
                        logger.info(`Model ${this.displayName} loaded`)
                        this.modelReady = true;
                    } else {
                        logger.warn(`Model ${this.displayName} is currently not ready`)
                        // try again later
                        setTimeout(async () => {
                            this.loadModel();
                        }, 3000);
                    }
                } catch(e) {
                    logger.warn(`Model ${this.displayName} is currently not ready`)
                    setTimeout(async () => {
                        this.loadModel();
                    }, 3000);
                } 
            
        }
        
    }

    getDetectionCapabilities(): string[] {
        return this.labels
    }


    async detectImage(image: Uint8Array): Promise<DetectedObject[]> {
        logger.info("Detecting image", image);
        const being = new Date().getTime();

        const formData = new FormData()
        formData.append('image_file', Buffer.from(image), { filename: "image_file" })
        const res = await axios.post(this.detectionRoute, formData);

        const end = new Date().getTime();
        logger.info(`${this.displayName}: Detection took ${end - being}ms`);

        return this.convertToDetectedObjects(res.data);
    }

    private convertToDetectedObjects(yolov8RemoteDetectionResults: {bbox: [number, number, number, number], predictionClass: string, predictionScore: number}[]) {
        const detectedObjects = [];

        for (const yolov8RemoteDetection of yolov8RemoteDetectionResults) {
            detectedObjects.push(new DetectedObject(yolov8RemoteDetection.predictionClass, yolov8RemoteDetection.predictionScore,
                [yolov8RemoteDetection.bbox[0], yolov8RemoteDetection.bbox[1], yolov8RemoteDetection.bbox[2], yolov8RemoteDetection.bbox[3]]));
        }

        return detectedObjects;
    }
}
