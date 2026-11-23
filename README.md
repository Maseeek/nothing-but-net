# Nothing But Net

Nothing But Net turns a video of someone shooting baskets into shooting stats. You upload a clip, mark the two edges of the rim, and it counts makes and misses, works out field goal percentage, and measures the angle of each shot.

[Live app](https://nbnc-maseeeks-projects.vercel.app) · [Case study](https://maciekgeneja.me/blog/nothing-but-net)

## What it does

- Tracks the ball through an uploaded video and records each shot as a make or a miss.
- Reports makes, attempts, FG%, longest streak and release angles for every session.
- Saves session history to your account and charts your progress over time.
- Has accounts with email verification and password reset.
- Has four plans (guest, free, standard, pro) with different upload limits and stats, paid through Stripe.
- Comes with a native Android app that records video courtside and sends it for analysis.

## How it's built

The repo has five parts:

- `src/client/`: React 19 and Vite web app, with Chart.js for history charts and Three.js for the animated background.
- `src/server/` and `api/`: Express 5 REST API with MongoDB (Mongoose). It handles JWT auth, bcrypt password hashing, email verification with Nodemailer, plan limits, and Stripe Checkout and webhooks.
- `cv_service/`: Python, Flask and OpenCV service that analyses the videos.
- `mobile/`: Android app in Kotlin with Jetpack Compose, CameraX, Retrofit, Room and Hilt. The JWT is kept in EncryptedSharedPreferences.
- `research-cv/`: the original desktop OpenCV prototype, used to try out detection and curve fitting.

A few decisions in the vision pipeline that I think are worth pointing out:

- Scale from the rim. Every video is resized to 640px wide. The expected ball radius is taken from the distance between the two rim points (a ball's radius is about 0.264 times the rim's diameter), so the Hough circle search only looks for circles of the right size, whatever the camera distance.
- Search near the last position first. Once the ball has been found, the next frame is only searched in a window around its last position. The whole frame is searched only if that fails. While no ball is in view, the service skips more frames, up to 30 at a time, and goes back to normal sampling as soon as it finds one.
- Throw out impossible jumps. A detection that is too far from the previous position to be physically possible is ignored. If the ball is lost for more than 20 frames mid-shot, the partial path is dropped so two shots don't get stitched together.
- Fit the arc. Ball positions near the hoop are fitted to a parabola with `np.polyfit`. A shot counts once the ball goes above the rim and then drops through it. The point where it crosses the rim line decides make or miss, and a 30-frame cooldown stops the net bounce counting twice.

The CV service has an accuracy test bench that compares results against hand-labelled `ground_truth.json`, plus a speed benchmark. The Android app has unit tests for its ViewModels and data classes. `benchmarks/` compares the old and new versions of the API's stats code.

Deployment: the web app is on Vercel (`vercel.json`). The API and CV service run as two Render services (`render.yaml`).

## Run it locally

You need Node.js 18+, Python 3.10+ and MongoDB (local or Atlas).

```bash
npm install
pip install -r cv_service/requirements.txt

cp .env.example .env
cp .env.client.example .env.local
cp src/server/.env.example src/server/.env   # add JWT, MongoDB, email and Stripe keys
```

Start the web app (:5173), API (:3000) and CV service (:5001) together:

```bash
npm run dev-all
```

Or run them one at a time with `npm run dev`, `npm run server` and `npm run python-server`.

CV tests and benchmark:

```bash
python cv_service/tests/test_bench.py
python cv_service/tools/server_benchmark.py
```

Android app (needs JDK 11+ and Android SDK 35):

```bash
cd mobile
./gradlew testDebugUnitTest
./gradlew assembleDebug
```

## Author

Maciek Geneja. [Portfolio write-up](https://maciekgeneja.me/blog/nothing-but-net) · [GitHub](https://github.com/Maseeek)
