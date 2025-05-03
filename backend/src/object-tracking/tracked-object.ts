import {IOUTrackable} from './trackable';

export class TrackedObject {
    private _trackable: IOUTrackable;
    private _missedReIds: number = 0;
    private _id: string;

    constructor(boundingBox: IOUTrackable, missedReIds: number = 0, id: string) {
        this._trackable = boundingBox;
        this._missedReIds = missedReIds;
        this._id = id;
    }

    public increaseMissedReIds() {
        this._missedReIds += 1;
    }

    get trackable(): IOUTrackable {
        return this._trackable;
    }

    get missedReIds(): number {
        return this._missedReIds;
    }

    get id() {
        return this._id;
    }

    public updateLastTrackable(boundingBox: IOUTrackable) {
        this._trackable = boundingBox;
        this._missedReIds = 0;
    }
}
