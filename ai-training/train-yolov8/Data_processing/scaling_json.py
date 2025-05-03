import json
import os
# Scaling the original image size in the labels

input_json_dir = r"..\labels\labels_json"
output_dir = r"..\labels\labels_json_scaled"

old_width = 512
old_height = 384

target_width = 640
target_height = 640

scale_x = target_width / old_width
scale_y = target_height / old_height
area_scale = (target_width / old_width) * (target_height / old_height)

for file_name in os.listdir(input_json_dir):
    input_path = os.path.join(input_json_dir, file_name)
    imagename =  os.path.basename(input_path) + '_scaled'
    with open(input_path, 'r') as f:
        data = json.load(f)

    for result in data['result']:
        result['original_width'] = target_width
        result['original_height'] = target_height

    for result in data['result']:
        result['value']['x'] *= scale_x
        result['value']['y'] *= scale_y
        result['value']['width'] *= scale_x
        result['value']['height'] *= scale_y
        
    output_json_path = os.path.join(output_dir, imagename)
    with open(output_json_path, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"Updated image sizes to {target_width}x{target_height} and saved to {output_json_path}")
