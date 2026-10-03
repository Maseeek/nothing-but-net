# Nothing But Net — Native Android Companion (`mobile/`)

Native **Kotlin** & **Jetpack Compose** Android client for the [Nothing But Net](https://nothingbutnet.online) basketball analytics ecosystem. Engineered for courtside video capture, real-time shooting session telemetry, and offline-resilient performance tracking.

---

## Architecture & Technical Stack

- **Language & Runtime**: Kotlin 2.0 (`jvmTarget = 11`, `minSdk = 29`, `targetSdk = 35`)
- **UI Framework**: Jetpack Compose (Material 3) implementing the custom **Liquid Glass & Ember** dark-first design system (`#121212` charcoal canvas, `#d64b17` ember accents, translucent surfaces)
- **Dependency Injection**: Dagger Hilt (`@HiltAndroidApp`, `NetworkModule`, `DatabaseModule`, `RepositoryModule`) with KSP code generation
- **Courtside Video Capture**: AndroidX **CameraX** (`camera-core`, `camera-camera2`, `camera-video`, `camera-lifecycle`) for hardware-accelerated courtside recording and frame extraction
- **Networking & API Integration**: Retrofit 2 + OkHttp 4 with custom `AuthInterceptor` for JWT bearer injection and multipart video upload to the Computer Vision service (`/upload-and-analyze`)
- **Offline Persistence & Security**:
  - **Room Database** (`SessionDao`, `SessionEntity`, `SessionProvider`) for local session caching and historical progression queries
  - **AndroidX Security Crypto** (`EncryptedSharedPreferences`) via `TokenManager` for hardware-backed JWT storage

---

## Package Structure

```text
mobile/app/src/main/java/com/example/nothingbutnetmobile/
├── data/
│   ├── local/          # Room database, SessionDao, ContentProvider & EncryptedSharedPreferences TokenManager
│   ├── remote/         # Retrofit AuthApi, CVApi, AuthInterceptor & DTO models
│   └── repository/     # Concrete repository implementations (Auth, CV, Stats)
├── di/                 # Hilt modules (DatabaseModule, NetworkModule, RepositoryModule)
├── domain/             # Domain models (User, Session) & repository interfaces
└── ui/
    ├── components/     # Reusable Compose HUD cards, FgProgressionGraph & LineChart
    ├── navigation/     # Compose NavHost (splash -> auth -> home / record / analysis / history / profile)
    ├── screens/        # Feature screens & Hilt ViewModels (Home, Record, Analysis, History, Profile, Auth)
    └── theme/          # Liquid Glass & Ember Material 3 color & typography tokens
```

---

## Building & Testing Locally

### Prerequisites
- JDK 11+ (or Android Studio Ladybug / AGP 9.0+)
- Android SDK Platform 35

### Commands

```bash
cd mobile

# Run unit tests (ViewModels, dispatchers & DTO serialization)
./gradlew testDebugUnitTest

# Assemble debug APK
./gradlew assembleDebug
```
