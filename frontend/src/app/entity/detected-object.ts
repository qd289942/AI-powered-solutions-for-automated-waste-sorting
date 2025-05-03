export interface DetectedObject {
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  detection_class: string;
  detection_timestamp: number;
  detection_certainty: number;
  img_path: string;

  ai_id: number;
  operation_section_id: number;
  x_detection_threshold: number;
}
