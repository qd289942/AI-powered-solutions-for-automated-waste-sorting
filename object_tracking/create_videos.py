import cv2
import os

import os

# Create the 'end_results' directory if it doesn't exist
if not os.path.exists('end_results'):
    os.makedirs('end_results')


def images_to_video(image_folder, video_name, fps=30):
    # Get a list of image filenames sorted by name
    images = sorted([img for img in os.listdir(image_folder) if img.endswith((".png", ".jpg", ".jpeg"))])

    # Check if there are any images in the folder
    if not images:
        print(f"No images found in {image_folder}")
        return

    # Read the first image to get the dimensions
    first_image_path = os.path.join(image_folder, images[0])
    frame = cv2.imread(first_image_path)
    height, width, layers = frame.shape

    # Define the codec and create a VideoWriter object
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec for mp4 format
    video = cv2.VideoWriter(video_name, fourcc, fps, (width, height))

    for image in images:
        image_path = os.path.join(image_folder, image)
        frame = cv2.imread(image_path)
        video.write(frame)

    # Release the video writer object
    video.release()
    print(f"Video saved as {video_name}")


# Example usage
tracking_folders = ['./tracking/1', './tracking/2', './tracking/3']
output_folder = './end_results'

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

for folder in tracking_folders:
    # Extract the folder number from the path
    folder_number = os.path.basename(folder)
    video_name = os.path.join(output_folder, f"{folder_number}.mp4")
    images_to_video(folder, video_name)

# Example usage
tracking_folders = ['./tracking/1', './tracking/2', './tracking/3']

for folder in tracking_folders:
    # Extract the folder number from the path
    folder_number = os.path.basename(folder)
    video_name = f"{folder_number}.mp4"
    images_to_video(folder, video_name)
