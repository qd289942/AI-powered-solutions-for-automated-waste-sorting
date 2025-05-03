from wip_aligned.track_objects_helper import *

model = load_model('wip_aligned/aligned-model.pt')
input_size = (3, 224, 224)  # Default to (3, 224, 224) if size cannot be determined

image_path = './frame/3/frame_0000.jpg'
image_tensor = preprocess_image(image_path, input_size)
detections = perform_inference(model, image_tensor)

print(detections)