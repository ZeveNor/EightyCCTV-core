import cv2
import pandas as pd
import numpy as np
import json
import os
from ultralytics import YOLO
import requests


os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|stimeout;10000000"
model = YOLO('yolo11s.pt')  
url = "rtsp://admin:L2DF3010@192.168.1.46:554/cam/realmonitor?channel=1&subtype=1"
# cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)
cap = cv2.VideoCapture('parking1.mp4')
SLOTS_FILE = "slots.json"
CLASS_FILE = "coco.txt"

# โหลด class list
with open(CLASS_FILE, "r") as f:
    class_list = f.read().splitlines()

# ตัวแปรเก็บพิกัดช่องจอด
parking_areas = []
current_area = []

# ถ้ามีไฟล์ช่องจอด ให้โหลดมาใช้เลย
if os.path.exists(SLOTS_FILE):
    with open(SLOTS_FILE, "r") as f:
        parking_areas = json.load(f)
        parking_areas = [ [tuple(point) for point in area] for area in parking_areas ]
        print(f"Loaded {len(parking_areas)} parking areas.")

# ฟังก์ชันคลิกเพื่อกำหนดช่องจอดใหม่
def select_parking_spots(event, x, y, flags, param):
    global current_area, parking_areas
    if event == cv2.EVENT_LBUTTONDOWN:
        current_area.append((x, y))
        print(f"Point: {x},{y}")
        if len(current_area) == 4:
            parking_areas.append(current_area)
            current_area = []
            print(f"New slot added. Total: {len(parking_areas)}")

# สร้างหน้าต่างให้คลิกช่องจอด ถ้ายังไม่มี
if len(parking_areas) == 0:
    cv2.namedWindow("Select Parking")
    cv2.setMouseCallback("Select Parking", select_parking_spots)

    ret, frame = cap.read()
    frame = cv2.resize(frame, (1020, 500))
    while True:
        temp = frame.copy()
        for area in parking_areas:
            cv2.polylines(temp, [np.array(area, np.int32)], True, (255, 0, 0), 2)
        cv2.imshow("Select Parking", temp)
        key = cv2.waitKey(1)
        if key == 13:  # Enter = save
            with open(SLOTS_FILE, "w") as f:
                json.dump(parking_areas, f)
            print("Saved to slots.json")
            break
        elif key == 27:  # ESC = exit without save
            break
    cv2.destroyWindow("Select Parking")

# ตรวจจับรถในที่จอด
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame = cv2.resize(frame, (1020, 500))

    results = model.predict(frame, conf=0.5, verbose=False)
    boxes = results[0].boxes.data
    if boxes is None or len(boxes) == 0:
        continue

    px = pd.DataFrame(results[0].boxes.data.cpu().numpy()).astype("float")
    occupied = [False] * len(parking_areas)
    
    for i, area in enumerate(parking_areas):
        poly = np.array(area, np.int32)
        for _, row in px.iterrows():
            x1, y1, x2, y2, _, cls_id = map(int, row)
            label = class_list[cls_id]
            if label == "car":  # จะเพิ่ม 'truck' ก็ได้
                cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                if label == "car": #นั้นคือรถ จุดนั้นแหละ
                    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                    if cv2.pointPolygonTest(poly, (cx, cy), False) >= 0:
                        occupied[i] = True
                        cv2.circle(frame, (cx, cy), 3, (0, 0, 255), -1)  # แสดงเฉพาะจุดกลาง
        # --- ส่งสถานะไป backend ---
    try:
        response = requests.post("http://localhost:5000/api/slots/status", json={"status": occupied})
        if response.status_code != 200:
            print("Failed to update backend:", response.status_code)
    except Exception as e:
        print("Error sending status:", e)


    # วาดช่องจอด
    for i, area in enumerate(parking_areas):
        poly = np.array(area, np.int32)
        color = (0, 0, 255) if occupied[i] else (0, 255, 0)
        cv2.polylines(frame, [poly], True, color, 2)
        cv2.putText(frame, f"Slot {i+1}", tuple(area[0]), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # แสดงจำนวนว่าง
    free_slots = occupied.count(False)
    cv2.putText(frame, f"Free Slots: {free_slots}/{len(parking_areas)}", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                (0, 255, 255), 2)

    cv2.imshow("Parking Detection", frame)
    if cv2.waitKey(0) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
