/* eslint-disable no-undef */
import CocoSSD from "../../src/artifical-intelligence/cocossd";
import IArtificialIntelligence from "../../src/artifical-intelligence/iartifical-intelligence";

import fs from "fs";
import DetectedObject from "../../src/data/detected-object";
import path from "path";



test("Detection of Test-Image women, should match specified object", async () => {
  const ai:IArtificialIntelligence = new CocoSSD();
  const img = fs.readFileSync(path.join(__dirname, "/images/woman.jpg"));
  const predictions = await ai.detectImage(new Uint8Array(img))
  
  const result: Array<DetectedObject> = 
  [ 
    new DetectedObject('person',
     0.9331048130989075,
     [
      80.02046048641205,
      41.04497730731964,
      960.5781018733978,
      1000.4327774047852
    ]
  )]

  expect(predictions.length).toBe(1);
  expect(predictions).toStrictEqual(result);
});
