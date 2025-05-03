import torch
from ultralytics import YOLO

def main():
    model = YOLO('yolov8m.pt')
    results = model.train(data="data.yaml", epochs=200, imgsz=640)

if __name__ == "__main__":
    import multiprocessing
    multiprocessing.freeze_support() 
    main()
