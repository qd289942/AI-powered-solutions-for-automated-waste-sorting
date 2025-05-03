import os
import random
from PIL import Image, ImageEnhance
import shutil

def adjust_brightness_and_saturation(image_path, output_path, brightness_factor, saturation_factor):
    """
    Adjust the brightness of an image by a given factor.
    """
    image = Image.open(image_path)
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(brightness_factor)
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(saturation_factor)
    image.save(output_path)


def random_adjust_brightness(input_dir, output_dir):
    """
    Randomly adjust the brightness of each image in a folder.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for filename in os.listdir(input_dir):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif')):
            input_path = os.path.join(input_dir, filename)

            # Random brightness factor and saturation factor between 0.5 and 1.4
            brightness_factor = random.uniform(0.5, 1.4)
            saturation_factor = random.uniform(0.5, 1.4)

            brightness_string = f"{brightness_factor:.2f}"
            saturation_string = f"{saturation_factor:.2f}"
            filename_adapted = brightness_string + '_' + saturation_string + '_' + filename
            output_path = os.path.join(output_dir, filename_adapted)
            adjust_brightness_and_saturation(input_path, output_path, brightness_factor, saturation_factor)
            print(f"Adjusted brightness of {filename} by a brightness factor of {brightness_factor:.2f} and saturation factor of {saturation_factor:.2f}")
            copy_and_rename_label(input_dir_label,output_dir_label,filename,filename_adapted)


def copy_and_rename_label(input_dir_label, output_dir_label, filename, filename_adapted):
    for filename_label in os.listdir(input_dir_label):
        input_path = os.path.join(input_dir_label, filename_label)
        if filename_label.lower().endswith(('.txt')):
            if os.path.splitext(filename_label)[0] == os.path.splitext(filename)[0]:
                new_filename = os.path.splitext(filename_adapted)[0] + '.txt'
                output_path = os.path.join(output_dir_label, new_filename)
                shutil.copy(input_path, output_path)
                print(f"Copied and renamed {filename} to {new_filename}")
                break

input_dir = input("Please enter the path to the input image directory: ")
output_dir = input("Please enter the path to the output image directory: ")
input_dir_label = input("Please enter the path to the input label directory: ")
output_dir_label = input("Please enter the path to the output label directory: ")

random_adjust_brightness(input_dir, output_dir)


