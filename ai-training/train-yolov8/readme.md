# Training von YOLOv8 Detektions/Klassifikations-Modell

In diesem Test wurde YOLOv8 Verwendet und es mit einem Dataset für Mülltrennung trainiert. Zuerst wird ein Klassifikationsmodell mit einem Datensatz von Kaggle trainiert und anschließend ein Detektionsmodell mit Bildern sowohl von Kaggle als auch von einem Förderband trainiert.

Hierbei handelt es sich um einen Versuch, eines Basismodells (yolov8s für Detektion bzw. yolov8s-cls für Klassifikation) auf ein neues Einsatzgebiet zu trainieren.

Das Tutorial hierfür findet sich unten:

1. Tutorial für Klassifikation [hier](https://docs.ultralytics.com/tasks/classify/)
2. Tutorial für Detektion [hier](https://docs.ultralytics.com/tasks/detect/)

## Datenquelle der Mülltrennung

1. Datensatz aus Kaggle [hier](https://www.kaggle.com/datasets/asdasdasasdas/garbage-classification)
2. Frame-für-Frame-Zerlegung eines Videos eines Förderbands mit verschiedenen Müll

## Voraussetzung

Bevor Sie beginnen, stellen Sie sicher, dass Sie die folgenden Werkzeuge und Bibliotheken installiert haben:
- Python (3.8 oder höher)
- [Anaconda](https://www.anaconda.com/)
- NVIDIA CUDA Toolkit (für GPU-Beschleunigung) 12.4 oder höher

## Setup der Umgebung

Virtuelle Umgebung erstellen und aktivieren

    conda create -n yolov8_env
    conda activate yolov8_env

YOLOv8 und Abhängigkeiten installieren:

    pip install ultralytics

# Install all packages together using conda
conda install -c pytorch -c nvidia -c conda-forge pytorch torchvision pytorch-cuda=11.8 ultralytics

Setting Up ClearML zur Visualisierung:
    
    pip install clearml 

Hier sind die Schritte zur Generierung und Hinzufügung des API-Schlüssels für ClearML:

- Erstellen Sie ein ClearML-Konto.
- Gehen Sie zu Einstellungen => Arbeitsbereich und klicken Sie auf "Neue Anmeldeinformationen erstellen".
- Kopieren Sie die Informationen unter dem LOCAL PYTHON Tab.
- Öffnen Sie das Terminal und aktivieren Sie die Umgebung, in der ClearML installiert ist.
- Geben Sie clearml-init ein und führen Sie es aus.
- Sie werden aufgefordert, die zuvor kopierten Informationen einzufügen.
- Ihre ClearML-Anmeldeinformationen sind nun im System hinterlegt.

CUDA installieren:

```python
nvidia-smi # check the GPU drive

conda install pytorch torchvision torchaudio pytorch-cuda=11.8 -c pytorch -c nvidia

or pip install torchvision==0.17.0+cu118 torchaudio==2.2.0+cu118 -f https://download.pytorch.org/whl/torch_stable.html

```

## Datensatz

### Struktur

Datensatzstruktur für YOLO Klassifikation [hier](https://docs.ultralytics.com/datasets/classify/)

Datensatzstruktur für YOLO Detektion [hier](https://docs.ultralytics.com/datasets/detect/)

### Anotation

Mithilfe eines Labeling-Tools (Label Studio) wurden die Bilder (mehr als 2000) annotiert.
```python
# Requires Python >=3.8
pip install label-studio

# Start the server at http://localhost:8080
label-studio
```

### Konfiguration

Das Ultralytics YOLO-Format ist ein Datensatz-Konfigurationsformat, das es ermöglicht, das Wurzelverzeichnis des Datensatzes, die relativen Pfade zu den Verzeichnissen für Trainings-/Validierungs-/Testbilder oder *.txt-Dateien mit Bildpfaden sowie ein Wörterbuch von Klassennamen zu definieren. Hier ist ein Beispiel data.yaml:

```yaml
# Train/val/test sets as 1) dir: path/to/imgs, 2) file: path/to/imgs.txt, or 3) list: [path/to/imgs1, path/to/imgs2, ..]
path: ../datasets/Garbage_classification  # dataset root dir
train: images/train  # train images (relative to 'path')
val: images/val  # val images (relative to 'path')
test:  images/test

# Classes (6 classes)
names:
  0: cardboard
  1: glass
  2: metal
  3: paper
  4: plastic
  5: trash
```
## Training

Trainiere YOLOv8n auf dem Mülltrennung-Datensatz für 100 Epochen bei einer Bildgröße von 640. Eine vollständige Liste der verfügbaren Argumente findest du auf der [Konfigurationsseite](https://docs.ultralytics.com/usage/cfg/). Hier ist auch ein Beispiel Training mit yolov8m.pt für Detektion:

```python
import torch
from ultralytics import YOLO

def main():
    model = YOLO('yolov8m.pt')
    results = model.train(data="data.yaml", epochs=100, imgsz=640)

if __name__ == "__main__":
    import multiprocessing
    multiprocessing.freeze_support() 
    main()
```

## Vorhersage

Nutzen Sie ein trainiertes YOLOv8n Modell, um Vorhersagen auf Bildern durchzuführen

```python
from ultralytics import YOLO

# Laden des Modells
model = YOLO("path/to/best.pt") 

# Vorhersage mit dem Modell
results = model("https://ultralytics.com/images/bus.jpg")
```

Mit einem trainierten Modell und der OpenCV-Bibliothek Echtzeit-Videoerkennung mit Bounding-Box durchführen:

```python
from ultralytics import YOLO
import cv2

model = YOLO(r'')

cap = cv2.VideoCapture(r'')


while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame)
    

    for result in results:
        boxes = result.boxes
        for box in boxes:

            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
            label = result.names[box.cls[0].item()] 
            confidence = box.conf[0].item()

            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, f'{label}: {confidence:.2f}', (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    cv2.imshow('YOLOv8 Video Detection', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

## Export

Exportieren Sie ein YOLOv8n-Modell in ein anderes Format wie ONNX oder CoreML. Informationen für Format finden Sie [hier](https://docs.ultralytics.com/tasks/detect/#predict)

```python
from ultralytics import YOLO

model = YOLO("path/to/best.pt")  

model.export(format="onnx")
```