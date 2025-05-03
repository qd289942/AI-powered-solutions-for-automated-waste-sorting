import os
import json

# Code to extract the information from labels as json file to a txt file with yolo pattern (only used when the format of the annotation is json)
results_dir = r"..\labels\labels_json"
output_dir = r"..\labels\labels_txt_yolo"

os.makedirs(output_dir, exist_ok=True)

# Define class mapping (you may have multiple classes)
class_mapping = {
    "cardboard": 0,  # Example: cardboard class is mapped to index 0
    "glass": 1,
    "metal": 2,
    "paper": 3,
    "plastic": 4,
    "trash": 5
}

for file_name in os.listdir(results_dir):
    input_path = os.path.join(results_dir, file_name)
    ## with open(input_path, "r") as input_file, open(output_path, "w") as output_file:
    input_file = open(input_path, "r")
    with open(input_path, "r") as input_file:
        try:
                
            data = json.load(input_file)

            # Extract annotations
            annotations = data["result"]
            
            if annotations:
            
                image_path = data["task"]["data"]["image"]
                image_name = os.path.basename(image_path)
                output_file_name = os.path.splitext(image_name)[0] + ".txt"
                output_file_name = output_file_name.split("5C")[-1]
                output_path = os.path.join(output_dir, output_file_name)
                output_file = open(output_path, "w")

                image_width = annotations[0]["original_width"]
                image_height = annotations[0]["original_height"]

                for annotation in annotations:
                    value = annotation["value"]
                    label = value["rectanglelabels"][0]
                    class_id = class_mapping[label]

                    x_center = value["x"] / 100 + value["width"] / 200
                    y_center = value["y"] / 100 + value["height"] / 200
                    width = value["width"] / 100
                    height = value["height"] / 100

                    # Save the annotation information into a txt file with yolo format
                    output_file.write(f"{class_id} {x_center} {y_center} {width} {height}\n")
                    output_file.close()
                
                    
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON in file {input_path}: {e}")
        except KeyError as e:
            print(f"Missing key {e} in file {input_path}")
        except Exception as e:
            print(f"Error processing file {input_path}: {e}")

print("extract finished")