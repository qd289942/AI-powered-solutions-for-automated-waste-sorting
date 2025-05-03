from ultralytics import YOLO

# Load the YOLOv8 model
model = YOLO("./yolov8m.pt")

# Export the model to ONNX format
model.export(format="onnx")
