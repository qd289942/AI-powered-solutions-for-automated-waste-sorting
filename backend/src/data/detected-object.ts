import {IOUTrackable} from '../object-tracking/trackable';

export default class DetectedObject extends IOUTrackable {
    public predictionClass: string;
    public predictionScore: number;
    public bbox: number[];
    public imageWidth?: number;

    constructor(predictionClass: string, predictionScore: number, bbox: number[]) {
        super();

        this.predictionClass = predictionClass;
        this.predictionScore = predictionScore;
        this.bbox = bbox;
    }

    height(): number {
        return this.bbox[3];
    }

    width(): number {
        return this.bbox[2];
    }

    x(): number {
        return this.bbox[0];
    }

    y(): number {
        return this.bbox[1];
    }
}
