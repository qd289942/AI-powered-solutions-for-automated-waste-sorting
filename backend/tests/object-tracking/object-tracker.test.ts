import {ObjectTracker} from '../../src/object-tracking/object-tracker';
import DetectedObject from '../../src/data/detected-object';

test("object tracker re-detects single moving object", async () => {
    const sut = new ObjectTracker(0.5, 5);
    let obj = new DetectedObject('glass', 1.0, [0, 0, 100, 100]);

    // Erste Detektion des neuen Objektes
    const redetectionResultsRunOne = sut.identifyObjects([obj]);

    // Objekt behält die Größe und bewegt sich nach rechts, so wie auf einem Förderband
    obj = new DetectedObject('glass', 1.0, [20, 0, 100, 100]);
    const reDetectionResultsRunTwo  = sut.identifyObjects([obj]);

    expect(reDetectionResultsRunTwo.length).toBe(1);
    expect(reDetectionResultsRunTwo[0].reIdentified).toStrictEqual(true);
    expect(reDetectionResultsRunTwo[0].id).toStrictEqual(redetectionResultsRunOne[0].id);
});

test("object tracker detects single new object as new at start", async () => {
    const sut = new ObjectTracker(0.5, 5);
    const obj = new DetectedObject('glass', 1.0, [0, 0, 100, 100]);

    const reDetectionResults = sut.identifyObjects([obj]);

    expect(reDetectionResults.length).toBe(1);
    expect(reDetectionResults[0].reIdentified).toEqual(false);
});

test("object tracker removes stale objects from tracking", async () => {
    const sut = new ObjectTracker(0.5, 2);
    let obj = new DetectedObject('glass', 1.0, [0, 0, 100, 100]);
    const anotherObj = new DetectedObject('plastic', 1.0, [500, 0, 100, 100]);

    // Zunächst werden 2 neue Objekte erkannt: obj befindet sich links am Rand und bewegt sich leicht nach rechts
    // anotherObj ist am rechten Rand der Kamera und wird im nächsten Frame der zur Erkennung genutzt wird so im Bild sein, dass die AI es verliert, also keine BBox mehr ermittelt
    sut.identifyObjects([obj, anotherObj]);
    expect(sut.getTrackedObjects().length).toBe(2);

    // AI verliert das plastikobjekt, es gibt keine Boundingbox mehr, der Tracker sieht also nur noch ein Objekt, das erste Objekt bewegt sich leicht nach rechts
    obj = new DetectedObject('glass', 1.0, [25, 0, 100, 100]);
    sut.identifyObjects([obj]);
    expect(sut.getTrackedObjects().length).toBe(2);

    obj = new DetectedObject('glass', 1.0, [50, 0, 100, 100]);
    sut.identifyObjects([obj]);

    // Annahme: Der Tracker hat das Objekt anotherObj 2 Mal nicht wieder erkannt, damit ist der Schwellwert von 2 erreicht, der Tracker sollte das Objekt daher als stale verwerfen
    expect(sut.getTrackedObjects().length).toBe(1);
});
