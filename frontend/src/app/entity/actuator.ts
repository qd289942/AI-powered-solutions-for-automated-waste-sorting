export interface Actuator {
  actuatorId ?: number;
  name: string;
  type: string;
  cameraDistance: number;
  activationTrashLabel: string[];
  operationSectionId: number;
  actuatorCalibration: number;
}
