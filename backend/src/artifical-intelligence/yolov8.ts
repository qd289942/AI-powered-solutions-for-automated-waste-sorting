import { logger } from "../util/logger";
import DetectedObject from "../data/detected-object";
import IArtificialIntelligence from "./iartifical-intelligence";
import * as tf from '@tensorflow/tfjs-node-gpu';

import yaml from 'js-yaml';
import * as fs from 'fs';
import path from "path";

type ModelMetatdata = {
  description: string,  //'Ultralytics detection model trained on data.yaml'
  author: string,       //'Ultralytics'
  date: string,         //'2024-06-22T08:43:52.413822'
  version: string       //'8.2.38'
  license: string       //'AGPL-3.0 License (https://ultralytics.com/license)'
  docs: string          //'https://docs.ultralytics.com',
  stride: number        //32
  task: string          //'detect'
  batch: number         //1
  imgsz: Uint32Array[]  //[ 640, 640 ]
  names: Object         // { '0': 'cardboard', '1': 'glass', '2': 'metal', '3': 'paper', '4': 'plastic', '5': 'trash' }

}

export default class YoloV8 implements IArtificialIntelligence {

    public displayName: string;
    public aiId?: number;

    private modelPath: string;
    private model!: tf.GraphModel
    private metadataPath: string;
    private metadata!: ModelMetatdata;
    private labels: string[];
    private numClass: number;;

    constructor(modelName: string) {
        this.displayName    = `YoloV8 ${modelName}`;
        this.modelPath      = path.join(__dirname, "models", modelName, "model.json");
        this.metadataPath   = path.join(__dirname, "models", modelName, "metadata.yaml");
        const metadataYAML  = fs.readFileSync(this.metadataPath, 'utf8');

        this.metadata = yaml.load(metadataYAML) as ModelMetatdata;
        this.labels = Object.values(this.metadata.names);
        this.numClass = this.labels.length;
        logger.info(`Model uses following labels ${this.labels}`)
        logger.info(`Loading model from ${this.modelPath}`)
        this.loadModel();
    }


  getDetectionCapabilities(): string[] {
    return this.labels
  }

  private loadModel = async () => {

      const handler = tf.io.fileSystem(this.modelPath);
      this.model = await tf.loadGraphModel(handler);
      logger.info(`Model ${this.displayName} loaded`)
  }


/**
 * Preprocess image / frame before forwarded into the model
 * @param {HTMLVideoElement|HTMLImageElement} source
 * @param {Number} modelWidth
 * @param {Number} modelHeight
 * @returns input tensor, xRatio and yRatio
 */
private preprocess = (image: tf.Tensor3D, modelWidth: number, modelHeight: number): [tf.Tensor<tf.Rank>, number, number] => {
    let xRatio:number = 1; 
    let yRatio: number = 1; 
  
    const input = tf.tidy(() => {
  
      // padding image to square => [n, m] to [n, n], n > m
      const [h, w] = image.shape.slice(0, 2); // get source width and height
      const maxSize = Math.max(w, h); // get max size
      const imgPadded = image.pad([
        [0, maxSize - h], // padding y [bottom only]
        [0, maxSize - w], // padding x [right only]
        [0, 0],
      ]);
  
      xRatio = maxSize / w; // update xRatio
      yRatio = maxSize / h; // update yRatio
  
      return tf.image
        //@ts-ignore
        .resizeBilinear(imgPadded, [modelWidth, modelHeight]) // resize frame
        .div(255.0) // normalize
        .expandDims(0); // add batch
    });
  
    return [input, xRatio, yRatio];
  };
  
    async detectImage(image: Uint8Array): Promise<DetectedObject[]> {
        const being = new Date().getTime();
        const modelWidth = 640;
        const modelHeight = 640;


        const imageTensor = tf.node.decodeImage(image, 3) as tf.Tensor3D;
        tf.engine().startScope(); // start scoping tf engine
        
        const [input, xRatio, yRatio] = this.preprocess(imageTensor, modelWidth, modelHeight); // preprocess image
        
        
        const res = this.model.execute(input) as tf.Tensor3D; // inference model
        
        const transRes = res.transpose([0, 2, 1]); // transpose result [b, det, n] => [b, n, det]
        const boxes = tf.tidy((): tf.Tensor2D => {
          const w = transRes.slice([0, 0, 2], [-1, -1, 1]); // get width
          const h = transRes.slice([0, 0, 3], [-1, -1, 1]); // get height
          const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2)); // x1
          const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2)); // y1
          return tf
            .concat(
              [
                x1,
                y1,
                tf.add(x1, w), //x2
                tf.add(y1, h), //y2
              ],
              2
            )
            .squeeze();
        });
        
        
        const [scores, classes] = tf.tidy(() => {
          // class scores
          //@ts-ignore
          const rawScores = transRes.slice([0, 0, 4], [-1, -1, this.numClass]).squeeze(0); // #6 only squeeze axis 0 to handle only 1 class models
          
          return [rawScores.max(1), rawScores.argMax(1)];
        }); // get max scores and classes index
      
        
        const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 500, 0.45, 0.2); // NMS to filter boxes
      
        const boxes_data = boxes.gather(nms, 0).dataSync(); // indexing boxes by nms index
        const scores_data = scores.gather(nms, 0).dataSync(); // indexing scores by nms index
        const classes_data = classes.gather(nms, 0).dataSync(); // indexing classes by nms index

        const detectedObjects: DetectedObject[] = [];

        for (let i = 0; i < scores_data.length; ++i) {
          // filter based on class threshold
          const detectionClass = this.labels[classes_data[i]];
          const score = scores_data[i]
      
          let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
          x1 *= xRatio;
          x2 *= xRatio;
          y1 *= yRatio;
          y2 *= yRatio;
          const width = x2 - x1;
          const height = y2 - y1; 

          detectedObjects.push(new DetectedObject(detectionClass, score, [x1, y1, width, height]));
      
        }

        tf.dispose([res, transRes, boxes, scores, classes, nms]); // clear memory
    
      
        tf.engine().endScope(); // end of scoping

        const end = new Date().getTime();
        logger.info(`${this.displayName}: Detection took ${end - being}ms`);
        //@ts-ignore
        return detectedObjects;
    }
}