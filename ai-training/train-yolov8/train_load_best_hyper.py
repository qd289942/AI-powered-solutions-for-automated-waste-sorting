from ultralytics import YOLO
import yaml
import os

best_model = "./Models/detection_v5.pt"
yaml_path = "./Results/detect/tune/best_hyperparameters.yaml"
print(f"YAML file path: {os.path.abspath(yaml_path)}")
with open(yaml_path, 'r', encoding='utf-8') as file:
    best_hyp = yaml.safe_load(file)

def main():
    model = YOLO(best_model)
    model.overrides = best_hyp
    #print(model.info)
    results = model.train(data="data.yaml", epochs=100, imgsz=640)

if __name__ == "__main__":
    import multiprocessing
    multiprocessing.freeze_support() 
    main()