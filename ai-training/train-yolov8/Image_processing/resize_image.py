import cv2
import os

target_size = (640, 640) 

image_folder = r"..\test\test_images"
resized_foler = r"..\test\image_resized"

os.makedirs(resized_foler, exist_ok=True)

#for root, dirs, files in os.walk(image_folder):
#    for sub_dir in dirs:
#        sub_dir_path = os.path.join(root, sub_dir)
for filename in os.listdir(image_folder):
    if filename.endswith('.jpg') or filename.endswith('.png'):

        image_path = os.path.join(image_folder, filename)
        image = cv2.imread(image_path)
        
        resized_image = cv2.resize(image, target_size)

        cv2.imwrite(os.path.join(resized_foler, f'{filename}'), resized_image)

print("resize finished")