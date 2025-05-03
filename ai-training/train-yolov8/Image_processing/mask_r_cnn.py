import torch
import torchvision
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt
import os


input_folder_path = r"..\test\test_images"
background_path = r".\background.jpg"
output_folder_path = r"..\test\image_maskrcnn_resnet50_fpn"
os.makedirs(output_folder_path, exist_ok=True)

model = torchvision.models.detection.maskrcnn_resnet50_fpn(pretrained=True)
model.eval()

for filename in os.listdir(input_folder_path):
    if filename.endswith('.jpg') or filename.endswith('.png') or filename.endswith('.jpeg'):
        image_path = os.path.join(input_folder_path, filename)
        output_image_path = os.path.join(output_folder_path, filename)

        image = Image.open(image_path)
        transform = torchvision.transforms.Compose([
            torchvision.transforms.ToTensor()
        ])
        image_tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            prediction = model(image_tensor)[0]

        background = Image.open(background_path)
        background = background.resize(image.size)

        foreground = np.array(image)
        background = np.array(background)

        if len(prediction['masks']) > 0:
            
            masks = prediction['masks'] > 0.5
            masks = masks.squeeze().cpu().numpy()

            # plt.imshow(masks[0], cmap='gray')
            # plt.show()

            for i in range(3): 
                foreground[:,:,i] = np.where(masks[0], foreground[:,:,i], background[:,:,i])

        result_image = Image.fromarray(foreground)
        # result.show()
        result_image.save(output_image_path)

print("replace finished")