import {TrackedObject} from './tracked-object';
import {IOUTrackable} from './trackable';
import 'crypto';

export type ReIdentificationResult = { reIdentified: boolean, id: string };

export class ObjectTracker {
    public readonly minIouOverlapThreshold: number;

    private readonly maxMisses: number;

    private trackedObjects: TrackedObject[] = [];

    constructor(minIouOverlapThresholdPercentual: number = 0.5, maxMisses: number = 5) {
        this.minIouOverlapThreshold = minIouOverlapThresholdPercentual;
        this.maxMisses = maxMisses;
    }

    private removeStaleObjects(tracks: TrackedObject[]): TrackedObject[] {
        return tracks.filter(track => track.missedReIds < this.maxMisses);
    }

    private findBestIouObject(trackedObject: TrackedObject, detections: IOUTrackable[], identifiedDetectionIndices: Set<number>): IOUTrackable | null {
        let bestMatch: IOUTrackable | null = null;
        let bestIou = this.minIouOverlapThreshold;

        for (let i = 0; i < detections.length; i++) {
            if (identifiedDetectionIndices.has(i)) {
                // Wenn ein verfolgtes Objekt bereits zugeordnet wurde, dann darf es nicht erneut zugeordnet werden
                continue;
            }

            const iou = trackedObject.trackable.calculateIOU(detections[i]);

            if (iou > bestIou) {
                bestMatch = detections[i];
                bestIou = iou;
            }
        }

        return bestMatch;
    }

    /**
     * Fügt einem Array von verfolgten Objekten neue Objekte anhand von nicht re-identifizierten Predictions hinzu.
     *
     * @param trackedObjects
     * @param detections
     * @param identifiedObjectIndices
     * @private
     */
    private addNewObjects(trackedObjects: TrackedObject[], detections: IOUTrackable[], identifiedObjectIndices: Set<number>): TrackedObject[] {
        for (let i = 0; i < detections.length; i++) {
            if (!identifiedObjectIndices.has(i)) {
                trackedObjects.push(new TrackedObject(detections[i], 0, crypto.randomUUID()));
            }
        }
        return trackedObjects;
    }

    /**
     * Versucht für jedes Object was aktuell getrackt wird die bestmögliche IOU zu ermitteln und so eine
     * Identitätsbeziehung zu den Predictions herzustellen (Objekt wird wiedererkannt).
     *
     * @param detections
     * @private
     */
    private updateExistingTrackings(detections: IOUTrackable[]): {
        trackedObjects: TrackedObject[],
        identifiedDetectionIndices: Set<number>
    } {
        const trackedObjects: TrackedObject[] = [];
        const identifiedDetectionIndices: Set<number> = new Set();

        for (let trackedObject of this.trackedObjects) {
            const currentHighestIou = this.findBestIouObject(trackedObject, detections, identifiedDetectionIndices);

            if (currentHighestIou !== null) {
                trackedObject.updateLastTrackable(currentHighestIou);

                identifiedDetectionIndices.add(detections.indexOf(currentHighestIou));
            } else {
                trackedObject.increaseMissedReIds();
            }

            trackedObjects.push(trackedObject);
        }

        return {trackedObjects, identifiedDetectionIndices};
    }

    public identifyObjects(detections: IOUTrackable[]): Array<ReIdentificationResult> {
        let {trackedObjects, identifiedDetectionIndices} = this.updateExistingTrackings(detections);
        trackedObjects = this.addNewObjects(trackedObjects, detections, identifiedDetectionIndices);
        trackedObjects = this.removeStaleObjects(trackedObjects);
        this.trackedObjects = trackedObjects;

        return this.getReIdenticationResults(detections, identifiedDetectionIndices);
    }

    public getTrackedObjects(): IOUTrackable[] {
        return this.trackedObjects.map(trackedObject => trackedObject.trackable);
    }

    private getReIdenticationResults<T extends IOUTrackable>(objects: Array<T>, identifiedObjectIndices: Set<number>): Array<ReIdentificationResult> {
        const reIdentificationResults = [];

        for (let i = 0; i < objects.length; i++) {
            reIdentificationResults.push({
                reIdentified: identifiedObjectIndices.has(i),
                id: this.getDetectedObjectTrackingId(objects[i])!,
            });
        }

        return reIdentificationResults;
    }

    private getDetectedObjectTrackingId(detectedObject: IOUTrackable) {
        for (let i = 0; i < this.trackedObjects.length; i++) {
            const currentTrackedObject = this.trackedObjects[i];

            if(currentTrackedObject.trackable === detectedObject) {
                return currentTrackedObject.id;
            }
        }
    }
}
