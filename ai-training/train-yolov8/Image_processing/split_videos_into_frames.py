import os
import shutil
from pathlib import Path
# split the videos into frames
def extract_images(source_dir, target_dir, interval=50):

    os.makedirs(target_dir, exist_ok=True)
    
    for root, dirs, files in os.walk(source_dir):
        for sub_dir in dirs:
            sub_dir_path = os.path.join(root, sub_dir)

            images = [f for f in os.listdir(sub_dir_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif'))]
            images.sort() 
            
            
            for i in range(0, len(images), interval):
                image_path = os.path.join(sub_dir_path, images[i])
                target_image_path = os.path.join(target_dir, f"{sub_dir}_{images[i]}")
                
                
                shutil.copy(image_path, target_image_path)
                print(f"Copied: {image_path} to {target_image_path}")

source_directory = r"..\frames\test_videos"
target_directory = r"..\frames\output_frames"

extract_images(source_directory, target_directory, interval=50)
