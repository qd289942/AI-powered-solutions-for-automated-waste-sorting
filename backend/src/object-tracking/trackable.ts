export abstract class IOUTrackable {
    public abstract height(): number;
    public abstract width(): number;
    public abstract x(): number;
    public abstract y(): number;

    public calculateArea(): number {
        return this.width() * this.height();
    }

    public calculateIntersection(trackable: IOUTrackable) {
        const x1 = Math.max(this.x(), trackable.x());
        const y1 = Math.max(this.y(), trackable.y());
        const x2 = Math.min(this.x() + this.width(), trackable.x() + trackable.width());
        const y2 = Math.min(this.y() + this.height(), trackable.y() + trackable.height());

        const width = Math.max(0, x2 - x1);
        const height = Math.max(0, y2 - y1);

        return width * height;
    }

    public calculateIOU(trackable: IOUTrackable) {
        const intersection = this.calculateIntersection(trackable);
        const union = trackable.calculateArea() + this.calculateArea() - intersection;

        return intersection / union;
    }
}
