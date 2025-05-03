import DetectedObject from "./detected-object";

export default interface TrashDetected {

    camera: {
        id: string;
        name: string;
    },
    detectedObjects: DetectedObject[];
    timestamp: number;
    

}