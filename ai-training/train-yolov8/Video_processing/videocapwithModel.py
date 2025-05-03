from ultralytics import YOLO
import cv2

model = YOLO(r"..\Models\detection_v6.pt")

cap = cv2.VideoCapture(r"..\frames\test_videos\Zahnstocher.mp4")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame)

    for result in results:
        boxes = result.boxes
        for box in boxes:

            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
            label = result.names[box.cls[0].item()] 
            confidence = box.conf[0].item()

            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, f'{label}: {confidence:.2f}', (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    cv2.imshow('YOLOv8 Video Detection', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()


