import cv2
import numpy as np
import tkinter as tk
from tkinter import filedialog
import math

# --- CONFIG ---
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
        self.ball_lost_count = 0

    def find_ball(self, frame):
        """Locates the ball in the current frame using HoughCircles with ROI optimization."""
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        chosen = None
        
        # 1. Try ROI search if we have a previous position
        if self.prev_circle is not None:
            prev_x, prev_y, _ = self.prev_circle
            margin = int(self.max_radius * 5) # Large margin to account for fast movement
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
                        # Transform back to global coordinates
                        gx = int(i[0] + x1)
                        gy = int(i[1] + y1)
                        gr = i[2]
                        
                        curr_dist = dist(gx, gy, prev_x, prev_y)
                        if curr_dist < best_dist:
                            best_dist = curr_dist
                            chosen = np.array([gx, gy, gr])

        # 2. Fallback to Full Frame Search if ROI failed or no previous circle
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
                    # If no previous circle, just pick the first one (or could prioritize center, etc)
                    chosen = circles[0, 0]

        return chosen

    def process_frame(self, frame, debug=False):
        """
        Analyzes a single frame, updates state, and returns modified frame (if debug=True).
        """
        basketball = self.find_ball(frame)
        
        # 1. Detection & Filtering
        if basketball is not None:
            new_x, new_y = int(basketball[0]), int(basketball[1])
            
            # Physic check: If the ball teleported > 300px, it's likely a false positive
            if self.center is not None:
                if dist(new_x, new_y, self.center[0], self.center[1]) > 300**2:
                     basketball = None # Reject detection

        if basketball is not None:
            self.prev_circle = (int(basketball[0]), int(basketball[1]), int(basketball[2]))
            self.center = (self.prev_circle[0], self.prev_circle[1])
            self.radius = self.prev_circle[2]
            self.ball_lost_count = 0 # Reset counter
            
            if debug:
                self.show_frame_with_ball_circled(frame, basketball)
        else:
            self.ball_lost_count += 1

        # 2. Glitch Filtering (User's Idea)
        # If we Lose the ball for > 20 frames, the shot probably ended or was a glitch
        if self.ball_lost_count > 20:
            if self.shot_in_progress:
                self.pos_list_x.clear()
                self.pos_list_y.clear()
                self.shot_in_progress = False
        
        if debug:
            self.draw_hoop(frame)

        # 3. Shot Logic
        if self.center is not None and self.cooldown == 0:
            # Check proximity to hoop height (optimization: only track when near tracking zone)
            if self.center[1] <= (self.hoop_min_height + self.radius * 5):
                # Don't add duplicate points if ball hasn't moved or was lost
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

        # 4. Shot Outcome Logic
        if len(self.pos_list_x) > 3:
            # If ball drops below hoop height and shot was in progress
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
            # Vector from index 0 to 2
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
            # ball is [x, y, r]
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

def get_video_path():
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename(title="Select Video File", filetypes=[("Video Files", "*.mp4;*.avi;*.mov")])
    return file_path

def getXandYValuesOfClick(frame, windowName):
    # function to detect mouse clicks
    def mouseClick(event, x, y, flags, param):
        nonlocal click_x, click_y, clicked
        if event == cv2.EVENT_LBUTTONDOWN:
            click_x, click_y = x, y
            clicked = True

    clicked = False
    click_x, click_y = -1, -1

    # creates a window for user to click
    cv2.namedWindow(windowName)
    cv2.setMouseCallback(windowName, mouseClick)

    # displays image
    cv2.imshow(windowName, frame)

    while not clicked:
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cv2.destroyAllWindows()
    print(f"X: {click_x}, Y: {click_y}")
    return click_x, click_y

def main():
    videoPath = get_video_path()
    if not videoPath:
        print("No video selected.")
        return

    # Initialize variables
    cap = cv2.VideoCapture(videoPath)
    
    if not cap.isOpened():
        print("Could not open video.")
        return

    ret, first_frame = cap.read()
    if not ret:
        print("Video is empty.")
        return
        
    print("Please click the LEFT side of the hoop...")
    hoopLeft = getXandYValuesOfClick(first_frame, "Left Side of Hoop")
    print("Please click the RIGHT side of the hoop...")
    hoopRight = getXandYValuesOfClick(first_frame, "Right Side of Hoop")
    
    cv2.destroyAllWindows()
    
    tracker = BasketballTracker(hoopLeft, hoopRight)
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        tracker.process_frame(frame, debug=True)
        
        cv2.putText(frame, f"FGM: {tracker.fgm}, FGA: {tracker.fga}, FG%: {(100 * tracker.fgm / tracker.fga) if tracker.fga > 0 else 0:.2f}", (50, 100), cv2.FONT_HERSHEY_SIMPLEX,1, VANILLA, 2, cv2.LINE_AA)

        cv2.imshow('frame', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'): 
            break

    cap.release()
    cv2.destroyAllWindows()
    
    print("\n--- Final Results ---")
    print(f"Total Shots: {tracker.fga}")
    print(f"Makes: {tracker.fgm}")
    print(f"Misses: {tracker.fga - tracker.fgm}")
    if tracker.fga > 0:
        print(f"FG%: {100 * tracker.fgm / tracker.fga:.1f}%")

if __name__ == "__main__":
    main()
