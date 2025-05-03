import cv2
import os

def extract_frames(video_path, output_folder):
    # Create the output folder if it does not exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Open the video file
    cap = cv2.VideoCapture(video_path)

    # Check if the video file opened successfully
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return

    frame_number = 0
    while True:
        # Read a frame from the video
        ret, frame = cap.read()

        # If we got a frame, save it
        if ret:
            frame_filename = os.path.join(output_folder, f"frame_{frame_number:04d}.jpg")
            cv2.imwrite(frame_filename, frame)
            frame_number += 1
        else:
            # No more frames left
            break

    # Release the video capture object
    cap.release()
    print(f"Extracted {frame_number} frames to {output_folder}")


# Usage example
extract_frames('./video_splitting/IMG_0384.mov', './results/IMG_0384/')
extract_frames('./video_splitting/IMG_0386.mov', './results/IMG_0386/')
extract_frames('./video_splitting/IMG_0387.mov', './results/IMG_0387/')
extract_frames('./video_splitting/IMG_0388.mov', './results/IMG_0388/')
extract_frames('./video_splitting/IMG_0389.mov', './results/IMG_0389/')
