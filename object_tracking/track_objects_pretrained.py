import cv2
import torch
from deep_sort_realtime.deepsort_tracker import DeepSort
import os

# Initialize YOLO model
model = torch.hub.load('ultralytics/yolov5', 'yolov5s')

# Initialize Deep SORT
tracker = DeepSort(max_age=30, n_init=3, nms_max_overlap=1.0, max_cosine_distance=0.2)

# Define input and output paths
input_base_path = './frame/'
output_base_path = './tracking/'

# Ensure output directories exist
os.makedirs(output_base_path, exist_ok=True)

# Process each folder
for folder_number in range(1, 4):  # Adjust range as needed
    input_folder_path = os.path.join(input_base_path, str(folder_number))
    output_folder_path = os.path.join(output_base_path, str(folder_number))
    os.makedirs(output_folder_path, exist_ok=True)

    # Get all image files in the input folder
    image_files = sorted([f for f in os.listdir(input_folder_path) if f.endswith('.jpg')])

    for image_file in image_files:
        image_path = os.path.join(input_folder_path, image_file)

        # Load the image
        img = cv2.imread(image_path)

        # Perform object detection with YOLO
        results = model(img)
        detections = results.xyxy[0]  # get the first image's detections

        # Prepare the detections for Deep SORT
        deep_sort_detections = []
        if detections.shape[0] > 0:
            bboxes = detections[:, :4].tolist()  # get bounding boxes as list
            confidences = detections[:, 4].tolist()
            class_ids = detections[:, 5].tolist()

            for bbox, confidence, class_id in zip(bboxes, confidences, class_ids):
                x1, y1, x2, y2 = bbox
                bbox_width = x2 - x1
                bbox_height = y2 - y1
                deep_sort_detections.append(([x1, y1, bbox_width, bbox_height], confidence, class_id))

        # Update tracker with the detections
        tracks = tracker.update_tracks(deep_sort_detections, frame=img)

        # Draw bounding boxes and IDs on the image
        for track in tracks:
            if not track.is_confirmed() or track.time_since_update > 1:
                continue
            track_id = track.track_id
            bbox = track.to_tlbr()
            cv2.rectangle(img, (int(bbox[0]), int(bbox[1])), (int(bbox[2]), int(bbox[3])), (0, 255, 0), 2)
            cv2.putText(img, f"ID: {track_id}", (int(bbox[0]), int(bbox[1]) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9,
                        (0, 255, 0), 2)

        # Write the output image
        output_image_path = os.path.join(output_folder_path, image_file)
        cv2.imwrite(output_image_path, img)

print("Processing complete.")
