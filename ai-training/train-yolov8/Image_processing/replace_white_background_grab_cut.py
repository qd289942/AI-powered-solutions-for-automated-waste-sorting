import cv2
import numpy as np
import os

def replace_white_background(file_path, background_path, output_path):

    image = cv2.imread(file_path)

    mask = np.zeros(image.shape[:2], np.uint8)

    bgdModel = np.zeros((1, 65), np.float64)
    fgdModel = np.zeros((1, 65), np.float64)

    rect = (50, 50, 450, 290)  

    cv2.grabCut(image, mask, rect, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_RECT)

    mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
    foreground = image * mask2[:, :, np.newaxis]

    new_background = cv2.imread(background_path)
    new_background = cv2.resize(new_background, (image.shape[1], image.shape[0]))

    result = np.where(mask2[:, :, np.newaxis] == 1, foreground, new_background)

    cv2.imwrite(output_path, result)


folder_path = r"..\test\test_images"
background_path = r".\background.jpg"
output_folder = r"..\test\image_background_changed_with_grabcut"

os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(folder_path):
    if filename.endswith('.jpg') or filename.endswith('.png') or filename.endswith('.jpeg'):
        file_path = os.path.join(folder_path, filename)
        output_path = os.path.join(output_folder, filename)
        replace_white_background(file_path, background_path, output_path)
