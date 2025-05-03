import IArtificialIntelligence from "../artifical-intelligence/iartifical-intelligence";
import DetectedObject from "../data/detected-object";
import { logger } from "../util/logger";

import * as cocoSsd from '@tensorflow-models/coco-ssd';

import * as tf from '@tensorflow/tfjs-node-gpu'



export default class CocoSSD implements IArtificialIntelligence {
    public  displayName: string;
    public aiId?: number;

    private static labels = [
        "person",
        "bicycle",
        "car",
        "motorcycle",
        "airplane",
        "bus",
        "train",
        "truck",
        "boat",
        "traffic light",
        "fire hydrant",
        "stop sign",
        "parking meter",
        "bench",
        "bird",
        "cat",
        "dog",
        "horse",
        "sheep",
        "cow",
        "elephant",
        "bear",
        "zebra",
        "giraffe",
        "backpack",
        "umbrella",
        "handbag",
        "tie",
        "suitcase",
        "frisbee",
        "skis",
        "snowboard",
        "sports ball",
        "kite",
        "baseball bat",
        "baseball glove",
        "skateboard",
        "surfboard",
        "tennis racket",
        "bottle",
        "wine glass",
        "cup",
        "fork",
        "knife",
        "spoon",
        "bowl",
        "banana",
        "apple",
        "sandwich",
        "orange",
        "broccoli",
        "carrot",
        "hot dog",
        "pizza",
        "donut",
        "cake",
        "chair",
        "couch",
        "potted plant",
        "bed",
        "dining table",
        "toilet",
        "tv",
        "laptop",
        "mouse",
        "remote",
        "keyboard",
        "cell phone",
        "microwave",
        "oven",
        "toaster",
        "sink",
        "refrigerator",
        "book",
        "clock",
        "vase",
        "scissors",
        "teddy bear",
        "hair drier",
        "toothbrush"
      ]
      

    private model!: cocoSsd.ObjectDetection;
    
    constructor() {
      
        this.displayName = "CocoSSD";
        this.loadModel();
    }


    private loadModel = async () => {
        logger.info("Waiting for model to load");
        const backend = tf.getBackend()
        logger.info(`using tfjs backend ${backend}`)   
        this.model = await cocoSsd.load()
        logger.info(`Model ${this.displayName} loaded`)
    }

    getDetectionCapabilities(): string[] {
        return CocoSSD.labels
    }

    async detectImage(image: Uint8Array): Promise<DetectedObject[]> {

        logger.info("Detecting image", image);
        const being = new Date().getTime();

        // Wait until the model is loaded
        if(this.model instanceof Promise) {
            logger.info("Waiting for model to load");
            this.model = await this.model
            logger.info(`Model ${this.displayName} loaded`)
        }

        const imageTensor = tf.node.decodeImage(image, 3) as tf.Tensor3D;
        //@ts-ignore
        const predictions = await this.model.detect(imageTensor);
        
        const end = new Date().getTime();
        logger.info(`${this.displayName}: Detection took ${end - being}ms`);

        return predictions.map((prediction: any) => {
            return new DetectedObject(prediction.class, prediction.score, prediction.bbox);
        });
    }
}