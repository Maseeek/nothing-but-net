from flask import Flask, request, jsonify
import os
import cv2
import numpy as np
import math
import json
from flask_cors import CORS
from werkzeug.utils import secure_filename

# PYTHON PROGRAM TO PROCESS VIDEO AND DETERMINE BASKETBALL OUTCOMES
MAX_FRAMES = 5000
app = Flask(__name__)

# Configure CORS
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://nothingbutnet.online",
    "https://www.nothingbutnet.online",
    os.environ.get("FRONTEND_URL"),
    os.environ.get("PRODUCTION_FRONTEND_URL")
]
allowed_origins = [origin for origin in allowed_origins if origin]

CORS(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=True)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Constants
PUMPKIN = (33, 121, 250)
CELADON = (187, 229, 169)
VANILLA = (177, 246, 252)
FELDGRAU = (59, 75, 63)
GREEN = (63, 99, 68)

dist = lambda x1, y1, x2, y2: (float(x1)-float(x2))**2 + (float(y1)-float(y2))**2

class BasketballTracker:
    def __init__(self, hoop_left, hoop_right):
        self.hoop_left = hoop_left
        self.hoop_right = hoop_right
        
        # Calculate hoop metrics
        hoop_dist = math.sqrt(dist(hoop_left[0], hoop_left[1], hoop_right[0], hoop_right[1]))
        self.ball_radius_est = 0.264 * hoop_dist
        self.hoop_max_height = min(hoop_left[1], hoop_right[1])
        self.hoop_min_height = max(hoop_left[1], hoop_right[1])
        
        # Detection parameters
        constant = 1.2
        self.min_radius = int(self.ball_radius_est / constant)
        self.max_radius = int(self.ball_radius_est * constant)
        
        # State variables
        self.shots = [] # 1 for make, 0 for miss
        self.shot_angles = []
        self.pos_list_x = []
        self.pos_list_y = []
        self.fga = 0
        self.fgm = 0
        self.cooldown = 0
        self.prev_circle = None
        self.center = None
        self.shot_in_progress = False
        self.radius = 0

    def find_ball(self, frame):
        """Locates the ball in the current frame using HoughCircles with ROI optimization."""
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        chosen = None
        
        # 1. Try ROI search if we have a previous position
        if self.prev_circle is not None:
            prev_x, prev_y, _ = self.prev_circle
            margin = int(self.max_radius * 5)
            h, w = gray_frame.shape
            
            x1 = max(0, int(prev_x - margin))
            y1 = max(0, int(prev_y - margin))
            x2 = min(w, int(prev_x + margin))
            y2 = min(h, int(prev_y + margin))
            
            if x2 > x1 and y2 > y1:
                roi = gray_frame[y1:y2, x1:x2]
                blurred_roi = cv2.GaussianBlur(roi, (17, 17), 0)
                
                circles = cv2.HoughCircles(
                    blurred_roi, cv2.HOUGH_GRADIENT, 1.2, 100,
                    param1=100, param2=30, 
                    minRadius=self.min_radius, maxRadius=self.max_radius
                )
                
                if circles is not None:
                    circles = np.uint16(np.around(circles))
                    best_dist = float('inf')
                    
                    for i in circles[0, :]:
                        gx = int(i[0] + x1)
                        gy = int(i[1] + y1)
                        gr = i[2]
                        
                        curr_dist = dist(gx, gy, prev_x, prev_y)
                        if curr_dist < best_dist:
                            best_dist = curr_dist
                            chosen = np.array([gx, gy, gr])

        # 2. Fallback to Full Frame Search
        if chosen is None:
            blurred_frame = cv2.GaussianBlur(gray_frame, (17, 17), 0)
            circles = cv2.HoughCircles(
                blurred_frame, cv2.HOUGH_GRADIENT, 1.2, 100,
                param1=100, param2=30, 
                minRadius=self.min_radius, maxRadius=self.max_radius
            )
            
            if circles is not None:
                circles = np.uint16(np.around(circles))
                if self.prev_circle is not None:
                    prev_x, prev_y, _ = self.prev_circle
                    best_dist = float('inf')
                    for i in circles[0, :]:
                        curr_dist = dist(i[0], i[1], prev_x, prev_y)
                        if curr_dist <= best_dist:
                            best_dist = curr_dist
                            chosen = i
                else:
                    chosen = circles[0, 0]

        return chosen

    def process_frame(self, frame, debug=False):
        basketball = self.find_ball(frame)
        
        # 1. Detection & Filtering
        if basketball is not None:
            new_x, new_y = int(basketball[0]), int(basketball[1])
            
            # Physic check: If the ball teleported > 300px, it's likely a false positive
            if self.center is not None:
                if dist(new_x, new_y, self.center[0], self.center[1]) > 300**2:
                     basketball = None 

        if basketball is not None:
            self.prev_circle = (int(basketball[0]), int(basketball[1]), int(basketball[2]))
            self.center = (self.prev_circle[0], self.prev_circle[1])
            self.radius = self.prev_circle[2]
            
            if debug:
                self.show_frame_with_ball_circled(frame, basketball)
        
        if debug:
            self.draw_hoop(frame)

        # 2. Shot Logic
        if self.center is not None and self.cooldown == 0:
            if self.center[1] <= (self.hoop_min_height + self.radius * 5):
                if not self.pos_list_x or (self.center[0] != self.pos_list_x[-1]):
                    self.pos_list_x.append(self.center[0])
                    self.pos_list_y.append(self.center[1])
                
                if self.center[1] < self.hoop_min_height:
                     self.shot_in_progress = True
                
                if debug:
                    if self.shot_in_progress:
                        cv2.putText(frame, "Shot in Progress", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, VANILLA, 2, cv2.LINE_AA)
                    if len(self.pos_list_x) > 1:
                        angle = self.calculate_angle()
                        cv2.putText(frame, f"Release Angle: {angle:.2f}", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, VANILLA, 2, cv2.LINE_AA)

        # 3. Shot Outcome Logic
        if len(self.pos_list_x) > 3:
            if self.pos_list_y[-1] > self.hoop_min_height and self.shot_in_progress:
                avg_x = (self.pos_list_x[-1] + self.pos_list_x[-2]) / 2
                
                if self.hoop_left[0] < avg_x < self.hoop_right[0]:
                    self.shots.append(1)
                    self.fgm += 1
                else:
                    self.shots.append(0)
                self.fga += 1

                self.shot_angles.append(self.calculate_angle())
                self.pos_list_x.clear()
                self.pos_list_y.clear()
                self.shot_in_progress = False
                self.cooldown = 30 
            elif debug:
                self.trace_predicted_path(frame)

        if self.cooldown > 0:
            self.cooldown -= 1
            
        return {
            "fgm": self.fgm,
            "fga": self.fga,
            "fg_percent": (100 * self.fgm / self.fga) if self.fga > 0 else 0.0,
            "frame": frame
        }

    def calculate_angle(self):
        if len(self.pos_list_x) < 3: return 0
        try:
            delta_x = self.pos_list_x[2] - self.pos_list_x[0]
            delta_y = self.pos_list_y[2] - self.pos_list_y[0]
            angle_radians = math.atan2(delta_y, delta_x)
            angle_degrees = -math.degrees(angle_radians)
            
            if 90 < angle_degrees < 180:
                angle_degrees = 180 - angle_degrees
            
            if 0 < angle_degrees < 90:
                return angle_degrees
            return 0
        except:
            return 0

    def draw_hoop(self, frame):
        cv2.circle(frame, self.hoop_left, 10, GREEN, cv2.FILLED)
        cv2.circle(frame, self.hoop_right, 10, GREEN, cv2.FILLED)
        cv2.line(frame, self.hoop_left, self.hoop_right, GREEN, 2)

    def show_frame_with_ball_circled(self, frame, ball):
        if ball is not None:
            x, y, r = int(ball[0]), int(ball[1]), int(ball[2])
            cv2.circle(frame, (x, y), r, PUMPKIN, 2)
            cv2.putText(frame, f"radius {r}", (x, y), cv2.FONT_HERSHEY_SIMPLEX, 1, PUMPKIN, 2, cv2.LINE_AA)

    def trace_predicted_path(self, frame):
        if len(self.pos_list_x) < 3: return
        try:
            A, B, C = np.polyfit(self.pos_list_x, self.pos_list_y, 2)
            width_of_frame = frame.shape[1]
            x_list = range(0, width_of_frame, 10) 
            pts = []
            for px, py in zip(self.pos_list_x, self.pos_list_y):
                cv2.circle(frame, (px, py), 10, PUMPKIN, cv2.FILLED)
                pts.append((px, py))
            if len(pts) > 1:
                cv2.polylines(frame, [np.array(pts)], False, PUMPKIN, 5)

            pred_pts = []
            for x in x_list:
                y = int(A * x ** 2 + B * x + C)
                if 0 <= y < frame.shape[0]:
                    pred_pts.append((x, y))
            if len(pred_pts) > 1:
                 cv2.polylines(frame, [np.array(pred_pts)], False, FELDGRAU, 2)
        except:
            pass

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
        if shotAngles[i] != 0:
            if not abs(sum(shotAngles) / len(shotAngles) - shotAngles[i]) > 2 * sum(shotAngles) / len(shotAngles):
                if shots[i] == 1:
                    shotsMadeAngle.append(shotAngles[i])
                else:
                    shotsMissedAngle.append(shotAngles[i])
    try:
        if not shotsMadeAngle and not shotsMissedAngle:
            return 0, 0, 0
        total_angles = shotsMadeAngle + shotsMissedAngle
        averageAngle = sum(total_angles) / len(total_angles) if total_angles else 0
        averageMakeAngle = sum(shotsMadeAngle) / len(shotsMadeAngle) if len(shotsMadeAngle) > 0 else 0
        averageMissAngle = sum(shotsMissedAngle) / len(shotsMissedAngle) if len(shotsMissedAngle) > 0 else 0
        return averageAngle, averageMakeAngle, averageMissAngle
    except:
        return 0, 0, 0

def analyze_video(videoPath, hoopLeft, hoopRight, max_frames, accuracy=0.15):
    tracker = BasketballTracker(hoopLeft, hoopRight)
    cap = cv2.VideoCapture(videoPath)
    frame_count = 0

    while cap.isOpened() and frame_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        frame_count += 1
        if frame_count % int(1/accuracy) != 0: 
            continue
        tracker.process_frame(frame, debug=False)
    cap.release()

    shots = tracker.shots
    shotAngles = tracker.shot_angles
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

    try:
        hoopLeftRaw = request.form.get('hoopLeft', '[0, 0]')
        hoopRightRaw = request.form.get('hoopRight', '[100, 0]')
        hoopLeft = json.loads(hoopLeftRaw)
        hoopRight = json.loads(hoopRightRaw)
        
        if isinstance(hoopLeft, dict):
            hoopLeft = [hoopLeft.get('x', hoopLeft.get('0', 0)), hoopLeft.get('y', hoopLeft.get('1', 0))]
        if isinstance(hoopRight, dict):
            hoopRight = [hoopRight.get('x', hoopRight.get('0', 100)), hoopRight.get('y', hoopRight.get('1', 0))]
    except Exception as e:
        return jsonify({'success': False, 'error': 'Invalid hoop coordinates'}), 400

    show_angle = request.form.get('showAngle', 'false').lower() == 'true'
    accuracy = 0.5 if show_angle else 0.15

    filename = secure_filename(video_file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    video_file.save(filepath)

    try:
        result = analyze_video(filepath, hoopLeft, hoopRight, MAX_FRAMES, accuracy)
        if os.path.exists(filepath):
             os.remove(filepath)
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)