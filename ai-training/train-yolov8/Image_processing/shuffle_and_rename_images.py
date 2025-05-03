import os
import random

def shuffle_and_rename_images(directory, prefix="img_", extension=".jpg"):
    
    files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]

    
    random.shuffle(files)

    
    for i, filename in enumerate(files):
        
        old_path = os.path.join(directory, filename)
        new_filename = f"{prefix}{i + 1}{extension}"
        new_path = os.path.join(directory, new_filename)

        
        os.rename(old_path, new_path)

    print(f"Renamed {len(files)} files in '{directory}'.")


directory = r""
shuffle_and_rename_images(directory)
