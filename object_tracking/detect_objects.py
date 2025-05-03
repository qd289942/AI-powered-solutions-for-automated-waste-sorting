import torch
import cv2
import os
import matplotlib.pyplot as plt
import numpy as np

# Load the YOLOv5 model
model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)

def detect_objects(image_path):
    # Load the image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Image at {image_path} could not be loaded")

    # Perform inference
    results = model(img)

    # Process results
    detections = results.xyxy[0].cpu().numpy()
    detected_objects = []
    for detection in detections:
        x1, y1, x2, y2, confidence, class_id = detection
        detected_objects.append({
            'class': results.names[int(class_id)],
            'bounding_box': [int(x1), int(y1), int(x2), int(y2)],
            'confidence': float(confidence)
        })

    return detected_objects


def draw_bounding_boxes(image_path, detections, output_path=None):
    # Load the image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Image at {image_path} could not be loaded")

    # Draw bounding boxes
    for detection in detections:
        x1, y1, x2, y2 = detection['bounding_box']
        class_name = detection['class']
        confidence = detection['confidence']

        # Draw rectangle
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        # Put label
        label = f"{class_name} {confidence:.2f}"
        cv2.putText(img, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)

    # Display the image with bounding boxes
    plt.figure(figsize=(10, 10))
    plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    plt.axis('off')
    plt.show()

    # Save the image with bounding boxes if output_path is provided
    if output_path:
        cv2.imwrite(output_path, img)


frame_folders = ['./frame/1', './frame/2', './frame/3']
detection_folders = ['./detection/1', './detection/2', './detection/3']

for frame_folder, detection_folder in zip(frame_folders, detection_folders):
    if not os.path.exists(detection_folder):
        os.makedirs(detection_folder)

    # List all images in the frame folder
    for image_filename in os.listdir(frame_folder):
        image_path = os.path.join(frame_folder, image_filename)
        output_image_path = os.path.join(detection_folder, image_filename)

        detections = detect_objects(image_path)
        draw_bounding_boxes(image_path, detections, output_path=output_image_path)
