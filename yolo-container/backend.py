from ultralytics import YOLO
from flask import request, Flask, jsonify
from waitress import serve
from PIL import Image
import torch

app = Flask(__name__)
model = YOLO("detection_v5.pt")
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

if torch.cuda.is_available():
    print('Cuda is available')
    torch.cuda.set_device('cuda:0')
else:
    print("Cuda is not available")

@app.route("/")
def root():
    """
    Site main page handler function.
    :return: Content of index.html file
    """
    with open("index.html") as file:
        return file.read()


@app.route("/status", methods=["GET"])
def status():
    """
    Site to return status of remote model
    :return: string ok, status 200
    """
    return "ok", 200

@app.route("/detect", methods=["POST"])
def detect():
    """
        Handler of /detect POST endpoint
        Receives uploaded file with a name "image_file", 
        passes it through YOLOv8 object detection 
        network and returns an array of bounding boxes.
        :return: a JSON array of DetectedObjects
        boxes in format 
        [{bbox: [x1,y1,w,h], predictionClass: string, predictionScore: number},..]
    """
    buf = request.files["image_file"]

    boxes = detect_objects_on_image(Image.open(buf.stream))
    return jsonify(boxes)    


def detect_objects_on_image(buf):
    """
    Function receives an image,
    passes it through YOLOv8 neural network
    and returns an array of detected objects
    :param buf: Input image file stream
    :return: Array of DetectedObjects
    [{bbox: [x1,y1,w,h], predictionClass: string, predictionScore: number},..]
    public predictionClass: string;
    public predictionScore: number;
    public bbox: number[x, y, w, h];
    """
    
    results = model.predict(buf)
    result = results[0]
    output = []
    for box in result.boxes:
        x1, y1, x2, y2 = [
          round(x) for x in box.xyxy[0].tolist()
        ]

        w = x2 - x1
        h = y2 - y1

        class_id = box.cls[0].item()
        prob = round(box.conf[0].item(), 2)
        detected_objects = {
            "predictionClass": result.names[class_id],
            "predictionScore":  prob,
            "bbox": [x1, y1, w, h]

        }

        

        #x1, y1, x2, y2, result.names[class_id], prob
        output.append(detected_objects)

    return output

serve(app, host='0.0.0.0', port=8080)