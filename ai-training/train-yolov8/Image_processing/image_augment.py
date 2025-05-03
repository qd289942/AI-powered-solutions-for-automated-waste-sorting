from torchvision.transforms import ColorJitter
from PIL import Image
import os

input_dir = r"..\test\test_images"
output_dir = r"..\test\image_augmented"

os.makedirs(output_dir, exist_ok=True)

for filename in os.listdir(input_dir):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
        input_path = os.path.join(input_dir, filename)

        # Load the image
        image = Image.open(input_path)

        brightness = 0.5
        contrast = 0.5
        saturation = 0.5
        hue = 0.5

        # Apply color jitter augmentation
        for i in range(3):
            jitter = ColorJitter(
                brightness=(1 - brightness, 1 + brightness),
                contrast=(1 - contrast, 1 + contrast),
                saturation=(1 - saturation, 1 + saturation),
                hue= (-hue, hue)
            )

            augmented_image = jitter(image)
            augmented_image.save(os.path.join(output_dir, f"augmented_image_{filename}_{i+1}.jpg"))