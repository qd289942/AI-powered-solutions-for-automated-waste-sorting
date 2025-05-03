from ultralytics import YOLO
import torch

#source: https://docs.ultralytics.com/modes/predict/#inference-sources
if torch.cuda.is_available():
    torch.cuda.set_device(0)


print(torch.cuda.current_device())

# Load a model
model = YOLO("detection_v3.pt")  # pretrained YOLOv8n model


# Run batched inference on a list of images
results = model(["../ai-training/train-yolov8/Dataset/Garbage_detection_resized/images/test/cardboard353.jpg"])  # return a list of Results objects

# Process results list
for result in results:
    boxes = result.boxes  # Boxes object for bounding box outputs
    masks = result.masks  # Masks object for segmentation masks outputs
    keypoints = result.keypoints  # Keypoints object for pose outputs
    probs = result.probs  # Probs object for classification outputs
    obb = result.obb  # Oriented boxes object for OBB outputs
    result.show()  # display to screen
    result.save(filename="result.jpg")  # save to disk