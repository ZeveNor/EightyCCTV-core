from inference_sdk import InferenceHTTPClient

import os
import cv2
import time
from fastapi import FastAPI
from fastapi.responses import JSONResponse

os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|stimeout;10000000"
url = "rtsp://admin:L2DF3010@172.2.10.3:554/cam/realmonitor?channel=1&subtype=1"

# initialize the client
CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="tSBimdbX6MHzfAbfx6zW"
)

model_id = "new-o9hkx-8rhlc/1"


def capture_and_send():
  # result = CLIENT.infer("test.jpg", model_id="new-o9hkx-8rhlc/1")
  # print(result);
  # return result
    cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)
    if not cap.isOpened():
        print("Cannot open RTSP stream")
        return {"error": "Cannot open RTSP stream"}
    try:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            return {"error": "Failed to grab frame"}
        img_path = "temp_rtsp_frame.jpg"
        cv2.imwrite(img_path, frame)
        try:
            result = CLIENT.infer(img_path, model_id=model_id)
            print(result)
            return result
        except Exception as e:
            print(f"Error sending to Roboflow: {e}")
            return {"error": str(e)}
    finally:
        cap.release()

def arrageCharacters():
    detections = capture_and_send()
    predictions = detections.get('predictions', [])
    if not predictions:
        return []

    heights = [p['height'] for p in predictions]
    avg_height = sum(heights) / len(heights) if heights else 1
    line_threshold = avg_height * 0.6

    lines = []
    for p in sorted(predictions, key=lambda x: x['y']):
        placed = False
        for line in lines:
            if abs(p['y'] - line[0]['y']) < line_threshold:
                line.append(p)
                placed = True
                break
        if not placed:
            lines.append([p])

    sorted_lines = [sorted(line, key=lambda x: x['x']) for line in lines]

    result = [[char['class'] for char in line] for line in sorted_lines]
    return result


# FastAPI app
app = FastAPI()

@app.get("/detect-once")
def detect_once():
    result = arrageCharacters()
    return JSONResponse(content=result)

# For local dev: uvicorn model:app --reload