import cv2
import numpy as np
import torch

def load_model(model_path):
    """
    Load the model from the given path.
    """
    model_dict = torch.load(model_path)
    model = model_dict['model']
    model.eval()  # Set the model to evaluation mode
    return model

def get_model_input_size(model):
    """
    Determine the expected input size for the model.
    """
    # Assuming the first layer is a Conv2d layer, which is common for image models
    for layer in model.modules():
        if isinstance(layer, torch.nn.Conv2d):
            return layer.in_channels, layer.kernel_size[0], layer.kernel_size[1]
    return None

def preprocess_image(image_path, input_size):
    """
    Preprocess the image to match the model's expected input size and format.
    """
    image = cv2.imread(image_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Convert BGR to RGB
    image = cv2.resize(image, (input_size[1], input_size[2]))  # Resize to the input size
    image = np.transpose(image, (2, 0, 1))  # Change shape from (H, W, C) to (C, H, W)
    image = image / 255.0  # Normalize to [0, 1]
    image = torch.tensor(image, dtype=torch.float32)
    image = image.unsqueeze(0)  # Add batch dimension
    return image

def perform_inference(model, image_tensor):
    """
    Perform inference using the model on the given image tensor.
    """
    image_tensor = image_tensor.half()

    with torch.no_grad():
        output = model(image_tensor)

    # Process the output to extract bounding boxes, class IDs, and confidence scores
    output = output[0]  # Assuming batch size of 1
    detections = []
    for detection in output:
        x_center, y_center, width, height, obj_score = detection[:5]
        class_scores = detection[5:]
        class_id = class_scores.argmax().item()
        confidence = class_scores[class_id].item()

        # Convert from center coordinates to corner coordinates
        x1 = x_center - width / 2
        y1 = y_center - height / 2
        x2 = x_center + width / 2
        y2 = y_center + height / 2

        detections.append([x1.item(), y1.item(), x2.item(), y2.item(), confidence, class_id])

    return torch.tensor(detections)
