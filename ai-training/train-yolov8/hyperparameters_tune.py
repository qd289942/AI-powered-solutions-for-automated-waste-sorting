from ultralytics import YOLO

def main():
    # Initialize the YOLO model
    model = YOLO(r".\Models\detection_v4.pt")

    # Tune hyperparameters on datasets for 30 epochs
    model.tune(data="data.yaml", epochs=30, iterations=50, optimizer="AdamW", plots=False, save=True, val=True)

if __name__ == "__main__":
    import multiprocessing
    multiprocessing.freeze_support() 
    main()