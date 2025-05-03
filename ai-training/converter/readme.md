# Requirements

* Docker

# YOLOv8 to ONNX:

* Dockerfile: Dockerfile.yolov8_to_onnx
* Script: export_to_onnx.py

Build and Run:

```bash
docker build -t yolov8_to_onnx -f Dockerfile.yolov8_to_onnx .
docker run --rm -v $(pwd):/app yolov8_to_onnx #bash
```
```PowerShell
docker build -t yolov8_to_onnx -f Dockerfile.yolov8_to_onnx .
docker run --rm -v ${PWD}:/app yolov8_to_onnx #powershell
```

# YoloV8 to TensorFlow.js:
Legen Sie das exportierte YOLOv8 Model in den gleichen Ordner, wie
das Dockerfile.yolov8_to_tfjs.

Passen Sie im Dockerfile innerhalb des Bereiches ENTRYPOINT den Namen des Models an.
Dieser ist derzeit auf "detection.pt" eingestellt.


Achtung das erzeugte Image besitzt eine größe von ca. 13GB!

* Dockerfile: Dockerfile.yolov8_to_tfjs

Build and Run:
```bash
docker build -t yolov8_to_tfjs -f Dockerfile.yolov8_to_tfjs .
docker run --rm -v $(pwd):/app yolov8_to_tfjs #bash
```

```PowerShell
docker build -t yolov8_to_tfjs -f Dockerfile.yolov8_to_tfjs .
docker run --rm -v ${PWD}:/app yolov8_to_tfjs #PowerShell
```