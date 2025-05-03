import {Actuator} from './actuator';
import {Ai} from './ai';

export interface OperationSection {
  operationSectionId: number;
  name: string;
  conveyerSpeed: number;
  cameraXThreshold: number;
  detectionMinThreshold: number;
  cameraPictureWidthMm: number;
  aiId: number;
  actuators: Actuator[];
  ai: Ai;
}
