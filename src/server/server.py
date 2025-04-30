from flask import Flask, request, jsonify, send_file
import os
import cv2
import numpy as np
import math
import json
from flask_cors import CORS
from werkzeug.utils import secure_filename

# RUNNING ON PORT 5000

cv2.setUseOptimized(True)

# PYTHON PROGRAM TO PROCESS VIDEO AND DETERMINE BASKETBALL OUTCOMES
# MAX_FRAMES = 1750 # optimal for my initial video
MAX_FRAMES = 5000
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Import your existing functions from main.py
dist = lambda x1, y1, x2, y2: (x1-x2)**2 + (y1-y2)**2

def findBall(frame, prevCircle, radius):
    CONSTANT = 1.2
    minRadius = int(radius / CONSTANT)
    maxRadius = int(radius * CONSTANT)
    chosen = None
    grayFrame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blurredFrame = cv2.GaussianBlur(grayFrame, (17, 17), 0)
    circles = cv2.HoughCircles(blurredFrame, cv2.HOUGH_GRADIENT, 1.2, 100,
                              param1=100, param2=30, minRadius=minRadius, maxRadius=maxRadius)
    if circles is not None:
        circles = np.uint16(np.around(circles))

        for i in circles[0, :]:
            if chosen is None: chosen = i
            if prevCircle is not None:
                if(dist(chosen[0], chosen[1], prevCircle[0], prevCircle[1]) <= dist(i[0], i[1], prevCircle[0], prevCircle[1])):
                    chosen = i
    return chosen

def calculateAngle(positionListX, positionListY):
    try:
        delta_x = positionListX[2] - positionListX[0]
        delta_y = positionListY[2] - positionListY[0]
        angle_radians = math.atan2(delta_y, delta_x)
        angle_degrees = -math.degrees(angle_radians)
        if angle_degrees > 90 and angle_degrees < 180:
            angle_degrees = 180 - angle_degrees
        if(angle_degrees > 0 and angle_degrees < 90):
            return angle_degrees
        else:
            return 0
    except:
        return 0

def getLongestStreak(array):
    longestStreak = 0
    currentStreak = 0
    for i in range(len(array)):
        if array[i] == 1:
            currentStreak += 1
            if currentStreak > longestStreak:
                longestStreak = currentStreak
        else:
            currentStreak = 0
    return longestStreak

def calculateAverageAngle(shotAngles, shots):
    shotsMadeAngle = []
    shotsMissedAngle = []

    for i in range(len(shots)):
        if (shotAngles[i] != 0):
            if not abs(sum(shotAngles) / len(shotAngles) - shotAngles[i]) > 2 * sum(shotAngles) / len(shotAngles):
                if shots[i] == 1:
                    shotsMadeAngle.append(shotAngles[i])
                else:
                    shotsMissedAngle.append(shotAngles[i])
    try:
        averageAngle = (sum(shotsMadeAngle) + sum(shotsMissedAngle)) / (len(shotsMissedAngle) + len(shotsMadeAngle))
        averageMakeAngle = sum(shotsMadeAngle) / len(shotsMadeAngle) if len(shotsMadeAngle) > 0 else 0
        averageMissAngle = sum(shotsMissedAngle) / len(shotsMissedAngle) if len(shotsMissedAngle) > 0 else 0
        return averageAngle, averageMakeAngle, averageMissAngle
    except:
        return 0, 0, 0

def analyze_video(videoPath, hoopLeft, hoopRight, max_frames, accuracy=0.15):
    shots = []
    shotAngles = []
    posListX = []
    posListY = []
    cap = cv2.VideoCapture(videoPath)

    ballRadius = 0.264 * math.sqrt(dist(hoopLeft[0], hoopLeft[1], hoopRight[0], hoopRight[1]))
    hoopMinHeight = max(hoopLeft[1], hoopRight[1])
    fga = 0
    fgm = 0
    cooldown = 0
    prevCircle = None
    center = None
    shotInProgress = False

    frame_count = 0

    while cap.isOpened() and frame_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % int(1/accuracy) != 0:  # Skip every other frame
            continue

        basketball = findBall(frame, prevCircle, ballRadius)

        if basketball is not None:
            prevCircle = (basketball[0], basketball[1], basketball[2])
            center = (int(basketball[0]), int(basketball[1]))
            radius = basketball[2]

        if center is not None:
            if center[1] <= (hoopMinHeight + radius * 5) and cooldown == 0:
                posListX.append(center[0])
                posListY.append(center[1])
                if center[1] < hoopMinHeight:
                    shotInProgress = True
                    if len(posListX) > 1 and len(posListY) > 1:
                        angle = calculateAngle(posListX, posListY)

        if len(posListX) > 3:
            if posListY[-1] > hoopMinHeight and shotInProgress:
                averageXOfLast2 = (posListX[-1] + posListX[-2]) / 2
                if hoopLeft[0] < averageXOfLast2 < hoopRight[0]:
                    shots.append(1)
                    fgm += 1
                else:
                    shots.append(0)
                fga += 1

                shotAngles.append(calculateAngle(posListX, posListY))
                posListX.clear()
                posListY.clear()

                shotInProgress = False
                cooldown = 30

        if cooldown > 0:
            cooldown -= 1

    cap.release()

    makes = shots.count(1) if shots else 0
    misses = shots.count(0) if shots else 0
    fg_percentage = 100 * makes / len(shots) if shots else 0
    longest_streak = getLongestStreak(shots)
    averageAngle, averageMakeAngle, averageMissAngle = calculateAverageAngle(shotAngles, shots) if shotAngles and shots else (0, 0, 0)

    result = {
        "total_shots": len(shots),
        "makes": makes,
        "misses": misses,
        "fg_percentage": round(fg_percentage, 2),
        "longest_streak": longest_streak,
        "average_angle": round(averageAngle, 2),
        "average_make_angle": round(averageMakeAngle, 2),
        "average_miss_angle": round(averageMissAngle, 2),
        "shot_angles": shotAngles,
        "shots_results": shots
    }

    return result
@app.route('/upload-and-analyze', methods=['POST'])
def upload_and_analyze():
    if 'video' not in request.files:
        return jsonify({'success': False, 'error': 'No video file provided'}), 400

    video_file = request.files['video']

    if video_file.filename == '':
        return jsonify({'success': False, 'error': 'Empty filename'}), 400

    # Get hoop coordinates from request
    try:
        hoopLeft = json.loads(request.form.get('hoopLeft', '[0, 0]'))
        hoopRight = json.loads(request.form.get('hoopRight', '[100, 0]'))
    except:
        return jsonify({'success': False, 'error': 'Invalid hoop coordinates'}), 400

    # Get showAngle status from request
    show_angle = request.form.get('showAngle', 'false').lower() == 'true'
    accuracy = 0.5 if show_angle else 0.15

    # Save the video file
    filename = secure_filename(video_file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    video_file.save(filepath)

    try:
        # Run the analysis
        result = analyze_video(filepath, hoopLeft, hoopRight, MAX_FRAMES, accuracy)

        # Clean up the file (optional)
        # os.remove(filepath)

        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)