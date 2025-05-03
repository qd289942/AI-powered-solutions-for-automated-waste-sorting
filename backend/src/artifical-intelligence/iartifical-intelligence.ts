import DetectedObject from "../data/detected-object";



export default interface IArtificialIntelligence {
    aiId?: number
    displayName: string;

    getDetectionCapabilities(): string[]

    detectImage(image: Uint8Array): Promise<DetectedObject[]>;

}