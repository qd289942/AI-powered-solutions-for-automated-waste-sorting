from ultralytics import YOLO
import numpy as np
import matplotlib.pyplot as plt
import os

def main():

    listOfIoUAndLabel = []
    listClassAP = []
    listAP = []

    for filename in os.listdir(label_path): # processing the labels of the test data
        if filename.endswith('.txt'):
            filename_path = os.path.join(label_path,filename)
            name_part_original = os.path.splitext(os.path.basename(filename_path))[0]
            with open(filename_path, 'r', encoding='utf-8') as file_ori:
                lines_ori = file_ori.readlines()
                if len(lines_ori) != 1:
                    continue
                else:
                    parameter_pre = []
                    numbers_ori = lines_ori[0].split()
                    class_ori = int(numbers_ori[0])
                    x_center_ori = float(numbers_ori[1])
                    y_center_ori = float(numbers_ori[2])
                    width_ori = float(numbers_ori[3])
                    height_ori = float(numbers_ori[4])
                    AoU = width_ori * height_ori

                    parameter_ori = [x_center_ori, y_center_ori, width_ori, height_ori]

                    parameter_pre, label_pre, confidence, lable_ori, class_name_dict = get_predicted_info(image_folder_path, name_part_original, class_ori)

                    if parameter_pre:
                        class_name_list = list(class_name_dict.values())
                        AoO = overlap_area(parameter_ori, parameter_pre) # Calculate intersection area
                        AoU = union_area(parameter_ori, parameter_pre, AoO) # Calculate union area
                        IoU = AoO / AoU # Intersection over Union
                        IoU_and_label = [IoU, label_pre, lable_ori]
                        listOfIoUAndLabel.append(IoU_and_label) # add current IoU to the list
                        print(f'{name_part_original} IoU: {IoU}; Label_original: {lable_ori}; Label_predicted: {label_pre}; Confidence: {confidence}')
                    else:
                        listOfIoUAndLabel.append([0,0,0]) # add 0 to represent an empty detection
                        print(f'{name_part_original}_no bonding-box found')

    listclassPrecisionRecallandThreshold = []

    # iterates throught the threshold generator
    for threshold in iou_thresholds():
        listclassmetrics = []

        for classname in class_name_list:
            # initialise the value
            true_positive = 0
            false_positive = 0
            false_negative = 0
            classnamewithmetrics = [classname, true_positive, false_positive, false_negative]
            listclassmetrics.append(classnamewithmetrics)
        
        for namewithmetrics in listclassmetrics:
            for IoU_and_label in listOfIoUAndLabel:
                if (IoU_and_label[0]):
                    if (IoU_and_label[0]) > threshold:
                        if IoU_and_label[2] == namewithmetrics[0]:
                            if IoU_and_label[1] == IoU_and_label[2]:
                                namewithmetrics[1] += 1 # true_positive
                            else:
                                namewithmetrics[3] += 1 # the object did not detected the real object from model: false_negative
                        else:
                            if IoU_and_label[1] == namewithmetrics[0]:
                                namewithmetrics[2] += 1 # the object dectect the object, but there is no object of this class in real: false_positive
                    else:
                        if IoU_and_label[2] == namewithmetrics[0]:
                            namewithmetrics[3] += 1
        
        print(f"\nIoU threshold: {threshold}")
        for namewithmetrics in listclassmetrics: 
            recall = calculate_recall(namewithmetrics[1], namewithmetrics[3])
            precision = calculate_precision(namewithmetrics[1], namewithmetrics[2])
            f1_score = calculate_f1_score(recall,precision)
            namewithmetrics = [namewithmetrics, recall, precision, f1_score, threshold]
            listclassPrecisionRecallandThreshold.append(namewithmetrics)
            print(f"\nClass: {namewithmetrics[0][0]}, Precision: {namewithmetrics[2]}, Recall: {namewithmetrics[1]}, F1-Score: {namewithmetrics[3]},")

    # Plot the Histogram of IoU, label_pre and label_ori

    plt.figure(figsize=(10, 6))
    filtered_data = [item for item in listOfIoUAndLabel if all(element != 0 for element in item)]
    listIoU = [item[0] for item in filtered_data]
    listlabel_pre = [item[1] for item in filtered_data]
    listlabel_ori = [item[2] for item in filtered_data]
    plt.figure(figsize=(10, 6))
    plt.hist(listIoU, bins=10, color='skyblue', edgecolor='black', density=True)
    plt.xlabel('IoU')
    plt.ylabel('Frequency')
    plt.title('Histogram of IoU')
    plt.grid(True)
    plt.savefig('./Evaluation/IoU_histogram.jpg')

    plt.figure(figsize=(10, 6))
    plt.hist(listlabel_pre, bins=len(class_name_list), color='skyblue', edgecolor='black', density=True)
    plt.xlabel('Predicted Label')
    plt.ylabel('Frequency')
    plt.title('Histogram of Predicted Labels')
    plt.ylim(0, 0.4)
    plt.grid(True)
    plt.savefig('./Evaluation/predicted_labels_histogram.jpg')

    plt.figure(figsize=(10, 6))
    plt.hist(listlabel_ori, bins=len(class_name_list), color='skyblue', edgecolor='black', density=True)
    plt.xlabel('Original Label')
    plt.ylabel('Frequency')
    plt.title('Histogram of Original Labels')
    plt.ylim(0, 0.4)
    plt.grid(True)
    plt.savefig('./Evaluation/original_labels_histogram.jpg')

    # Plot the F1-Score Curve
    plt.figure(figsize=(10, 6))
    for classname in class_name_list:
        listF1Score = []
        listThreshold = []
        for metrics in listclassPrecisionRecallandThreshold:
            name = metrics[0][0]
            if name == classname:
                f1_score = metrics[3]
                threshold = metrics[4]
                listF1Score.append(f1_score)
                listThreshold.append(threshold)
        listF1Scorenp = np.array(listF1Score)
        listThresholdnp = np.array(listThreshold)

        plt.plot(listThresholdnp, listF1Scorenp, label=f'{classname}')

    plt.xlabel('Threshold')
    plt.ylabel('F1-Score')
    plt.title('F1-Score-Threshold Curve')
    plt.legend()
    plt.grid(True)
    if not os.path.exists(r'.\Evaluation'):
        os.makedirs(r'.\Evaluation')
    plt.savefig(r'.\Evaluation\F1-Score-Threshold Curve.jpg')

    # Plot the Precision Recall Curve
    plt.figure(figsize=(10, 6))

    for classname in class_name_list:
        listPrecision = []
        listRecall = []
        for metrics in listclassPrecisionRecallandThreshold:
            name = metrics[0][0]
            if name == classname:
                recall = metrics[1]
                precision = metrics[2]

                listPrecision.append(precision)
                listRecall.append(recall)
    
        listPrecisionnp = np.array(listPrecision)
        listRecallnp = np.array(listRecall)

        # Compute the average precision
        average_precision = compute_ap(listPrecisionnp, listRecallnp)
        classAP = [classname, average_precision]
        listAP.append(average_precision)
        listClassAP.append(classAP)
        print(f"\nClass: {classname}, AP: {average_precision}")

        # Plot precision and recall
        plt.plot(listRecallnp, listPrecisionnp, label=f'{classname}')

    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-Recall Curve')
    plt.legend()
    plt.grid(True)
    if not os.path.exists(r'.\Evaluation'):
        os.makedirs(r'.\Evaluation')
    plt.savefig(r'.\Evaluation\Precision-Recall Curve.jpg')


    # Plot the AP Bar chart
    plt.figure(figsize=(10, 6))
    for classAP in listClassAP:
        plt.bar(classAP[0], classAP[1], color=np.random.rand(len(class_name_list), 3))
    plt.xlabel('Class')
    plt.ylabel('Average Precision (AP)')
    plt.title('Average Precision per Class')
    plt.ylim(0, 1)
    plt.grid(axis='y')
    mAP = np.mean(listAP)
    plt.text(len(class_name_list) - 1, 0.9, f'mAP: {mAP:.4f}', fontsize=12, ha='right')
    print(f'\nmAP: {mAP}')
    if not os.path.exists(r'.\Evaluation'):
        os.makedirs(r'.\Evaluation')
    plt.savefig(r'.\Evaluation\Average Precision per Class.jpg')


    
    print(f"\nEvaluation finished.")


def get_predicted_info(image_folder_path, name_part_original, class_name):
    result_pre = []

    for filename in os.listdir(image_folder_path):
        if filename.endswith('.jpg') or filename.endswith('.png') or filename.endswith('.jpeg'):
            image_path = os.path.join(image_folder_path, filename)
            name_part_predicted = os.path.splitext(os.path.basename(image_path))[0]
            if name_part_predicted.lower() == name_part_original.lower():
                results = model(image_path, imgsz=640) # predict the image using the model and return a single result object
                boxes = results[0].boxes  # boxes object for bounding box outputs
                label_ori = results[0].names[class_name]
                if len(boxes) > 0:
                    confidence_saved = 0
                    for i,box in enumerate(boxes):
                        x1, y1, x2, y2 = box.xyxyn[0].cpu().numpy().astype(float)
                        class_index = int(box.cls[0].item())
                        label = results[0].names[class_index]
                        class_name_dict = results[0].names
                        confidence = box.conf[0].item()

                        # set the threshold of confidence
                        if (confidence > 0.6):
                            if not result_pre: 
                                result_pre = get_center_width_height(x1, y1, x2, y2)
                                confidence_saved = confidence
                            else:
                                if confidence > confidence_saved: # use the prediction with maximum confidence
                                    result_pre = get_center_width_height(x1, y1, x2, y2)
                                    confidence_saved = confidence
                    return result_pre, label, confidence_saved, label_ori, class_name_dict
    return result_pre, 0, 0, 0, 0


def iou_thresholds(start=0.5, end=1.0, step=0.05): # define a generator for iou_thresholds
    current = start
    while current <= end:
        yield current
        current += step

def get_center_width_height(x1, y1, x2, y2):
    x_center = (x1 + x2) / 2
    y_center = (y1 + y2) / 2
    width = abs(x1-x2)
    height = abs(y1-y2)
    result = [x_center, y_center, width, height]
    return result

                        
def overlap_area(para_1, para_2):

    x1, y1, w1, h1 = para_1
    left1 = x1 - w1 / 2
    right1 = x1 + w1 / 2
    top1 = y1 + h1 / 2
    bottom1 = y1 - h1 / 2

    x2, y2, w2, h2 = para_2
    left2 = x2 - w2 / 2
    right2 = x2 + w2 / 2
    top2 = y2 + h2 / 2
    bottom2 = y2 - h2 / 2

    # calculate the coordination of the overlaped area
    overlap_left = max(left1, left2)
    overlap_right = min(right1, right2)
    overlap_top = min(top1, top2)
    overlap_bottom = max(bottom1, bottom2)

    if overlap_right > overlap_left and overlap_top > overlap_bottom:
        overlap_width = overlap_right - overlap_left
        overlap_height = overlap_top - overlap_bottom
        return overlap_width * overlap_height
    else:
        return 0

def union_area(para_1, para_2, overlap_area):
    x1, y1, w1, h1 = para_1
    x2, y2, w2, h2 = para_2

    pred_area = w2 * h2
    ori_area = w1 * h1

    union_area = pred_area + ori_area - overlap_area
    return union_area



def calculate_precision(true_positive, false_positive):
    try:
        precision = float(true_positive / (true_positive + false_positive))
        return precision
    except ZeroDivisionError:
        return 0.0

def calculate_recall(true_positive, false_negative):
    try:
        recall = float(true_positive / (true_positive + false_negative))
        return recall
    except ZeroDivisionError:
        return 0.0

def calculate_f1_score(recall,precision):
    try:
        f1_score = float(precision * recall / (precision + recall)) * 2
        return f1_score
    except ZeroDivisionError:
        return 0.0

def compute_ap(precision, recall):
    
    # Sort recall and precision based on recall
    sorted_indices = np.argsort(recall)
    recall = np.array(recall)[sorted_indices]
    precision = np.array(precision)[sorted_indices]

    # Add points at recall 0 and 1 for interpolation
    recall = np.concatenate(([0.0], recall, [1.0]))
    precision = np.concatenate(([precision[0]], precision, [0.0]))

    # Determine Interpolation Points
    recall_points = np.linspace(0, 1, 101)
    
    # Use linear interpolation to calculate the precision value for each standard recall
    precision_interp = np.interp(recall_points, recall, precision)
    
    # Calculates the precision value for each standard recall interval and then averages these precision values as the AP
    average_precision = np.mean(precision_interp)
    
    return average_precision


image_folder_path = r".\Datasets\Garbage_detection_resized_and_image_augmented\images\test"
model_path = r".\Models\detection_v6.pt"
label_path = r".\Datasets\Garbage_detection_resized_and_image_augmented\labels\test"

model = YOLO(model_path)  # load a custom model
main()
