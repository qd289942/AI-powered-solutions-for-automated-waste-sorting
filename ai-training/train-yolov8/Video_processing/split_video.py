import cv2
import os

def split_video_into_frames(video_directory, output_dir):
    for filename in os.listdir(video_directory):
        video_path = os.path.join(video_directory, filename)
        base = os.path.basename(filename)
        name_only = os.path.splitext(base)[0]
        output_subdir = os.path.join(output_dir, name_only)

        # Open the video file
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Error opening video file {video_path}")
            return
        
        os.makedirs(output_subdir, exist_ok=True)

        # Calculate the fps and frames
        interval_sec = 1
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_interval = int(fps * interval_sec)

        # Initialize frame count and read the first frame
        frame_count = 0
        saved_frame_count = 0
        ret, frame = cap.read()

        while ret:
            if frame_count % frame_interval == 0:
                # Construct output file path
                last_folder_name = os.path.basename(os.path.normpath(output_subdir))
                output_filename = f"{last_folder_name}_frame_{saved_frame_count}.jpg"
                output_path = os.path.join(output_subdir, output_filename)

                # Save the frame as an image file
                cv2.imwrite(output_path, frame)

                # Print status message
                print(f"Saved frame {frame_count} as {output_filename}")

                saved_frame_count += 1

            # Read next frame
            ret, frame = cap.read()
            frame_count += 1

        # Release the video capture object and close all windows
        cap.release()
        cv2.destroyAllWindows()

input_dir = input("Please enter the video directory: ")
output_dir = input("Please enter the path to the directory to save frames: ")

os.makedirs(output_dir, exist_ok=True)

split_video_into_frames(input_dir, output_dir)