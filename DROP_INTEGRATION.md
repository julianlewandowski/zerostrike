# ZeroStrike Hardware Integration Guide

## Architecture

```
                         ┌─────────────────────────────────┐
                         │   Firestore (DB: zero-strike)   │
                         │                                 │
                         │  drops/current    ← ESP32 drop  │
                         │  missions/current ← Drone nav   │
                         └──────────┬──────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
    Dashboard UI            Cloud Function              Android App
  (React frontend)        (Flask, us-central1)        (DJI MSDK v5)
         │                          │                          │
  POST /api/drop ──────────> writes Firestore          Firestore listener
  POST /api/mission ───────> writes Firestore ────────> DroneController
  onSnapshot ←──────────────── real-time updates               │
                                    │                          │
                               ESP32 polls                     │
                            GET /api/drop-status               │
                            POST /api/drop-confirm         flies drone
```

---

## 1. Drop Payload System (ESP32 Servo)

### API Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `POST` | `/api/drop` | Arms the drop | `{"ok": true, "status": "drop"}` |
| `POST` | `/api/reset-drop` | Resets the hook | `{"ok": true, "status": "reset"}` |
| `GET` | `/api/drop-status` | Current status (plain text) | `idle` / `drop` / `reset` |
| `POST` | `/api/drop-confirm` | ESP32 confirms action | `{"ok": true, "status": "idle"}` |

### Firestore Document: `drops/current`

```json
{
  "status": "idle",
  "confirmed": true,
  "timestamp": "2026-02-22T05:00:00Z",
  "confirmedAt": "2026-02-22T05:00:01Z"
}
```

---

## 2. Mission Dispatch System (Drone Navigation)

The dashboard can dispatch the drone to threat coordinates. The Android app listens to Firestore in real-time and executes missions using DJI's native waypoint system.

### API Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/mission` | Dispatch drone to waypoints | See below |
| `GET` | `/api/mission-status` | Get current mission state | — |
| `POST` | `/api/abort-mission` | Abort current mission | — |
| `POST` | `/api/mission-update` | Drone app updates progress | `{"droneStatus": "...", "droneMessage": "..."}` |

### POST /api/mission — Request Body

```json
{
  "waypoints": [
    {"lat": 36.20, "lng": -118.40, "alt": 50},
    {"lat": 36.25, "lng": -118.35, "alt": 50}
  ],
  "speed": 10.0,
  "type": "native"
}
```

- `waypoints`: Array of `{lat, lng, alt}` objects. At least 1 required. For DJI native missions, 2+ required.
- `speed`: Flight speed in m/s (default: 10)
- `type`: `"native"` (DJI KMZ wayline, most reliable) or `"virtualstick"` (PID-controlled)

### Firestore Document: `missions/current`

```json
{
  "status": "executing",
  "waypoints": [{"lat": 36.20, "lng": -118.40, "alt": 50}],
  "speed": 10.0,
  "type": "native",
  "timestamp": "2026-02-22T05:00:00Z",
  "droneStatus": "executing",
  "droneMessage": "Flying 2 waypoints"
}
```

**Status lifecycle**: `pending` → `executing` → `completed` / `failed` / `aborted`

**droneStatus values**: `waiting` → `starting` → `executing` → `done` / `error` / `idle`

---

## Firebase/Firestore Setup

### Already Done

- Firestore database `zero-strike` created in `eur3`
- Cloud Function `api` deployed to `us-central1`
- ESP32 firmware updated and tested end-to-end
- Android app has Firestore listener for missions

### Deploy Backend Updates

```bash
cd zerostrike
firebase deploy --only functions
```

### Verify Mission Endpoints

```bash
# Dispatch a mission
curl -X POST -H "Content-Type: application/json" \
  -d '{"waypoints":[{"lat":36.20,"lng":-118.40,"alt":50},{"lat":36.25,"lng":-118.35,"alt":50}],"speed":10}' \
  https://us-central1-zero-strike.cloudfunctions.net/api/api/mission

# Check mission status
curl https://us-central1-zero-strike.cloudfunctions.net/api/api/mission-status

# Abort mission
curl -X POST -H "Content-Length: 0" \
  https://us-central1-zero-strike.cloudfunctions.net/api/api/abort-mission
```

---

## Frontend Integration (TODO)

### 1. Add Firestore to `frontend/src/lib/firebase.ts`

```typescript
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const db = getFirestore(app, "zero-strike");
```

**Important**: Pass `"zero-strike"` as the second arg to `getFirestore()` since the database ID is `zero-strike`, not `(default)`.

### 2. Add API functions to `frontend/src/main-app/services/api.js`

```javascript
// ── Drop Payload ─────────────────────────────────────────────────────
export const triggerDrop = () =>
  fetch(apiUrl('/api/drop'), { method: 'POST' }).then(r => r.json());

export const resetDrop = () =>
  fetch(apiUrl('/api/reset-drop'), { method: 'POST' }).then(r => r.json());

// ── Mission Dispatch ─────────────────────────────────────────────────
export const dispatchMission = (waypoints, speed = 10, type = 'native') =>
  fetch(apiUrl('/api/mission'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ waypoints, speed, type }),
  }).then(r => r.json());

export const getMissionStatus = () =>
  fetch(apiUrl('/api/mission-status')).then(r => r.json());

export const abortMission = () =>
  fetch(apiUrl('/api/abort-mission'), { method: 'POST' }).then(r => r.json());
```

### 3. Real-time hooks

Create `frontend/src/hooks/useDropStatus.js`:

```javascript
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useDropStatus() {
  const [state, setState] = useState({ status: 'idle', confirmed: true });
  useEffect(() => {
    return onSnapshot(doc(db, 'drops', 'current'), (snap) => {
      if (snap.exists()) setState(snap.data());
    });
  }, []);
  return state;
}
```

Create `frontend/src/hooks/useMissionStatus.js`:

```javascript
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useMissionStatus() {
  const [state, setState] = useState({ status: 'idle' });
  useEffect(() => {
    return onSnapshot(doc(db, 'missions', 'current'), (snap) => {
      if (snap.exists()) setState(snap.data());
    });
  }, []);
  return state;
}
```

### 4. UI Components Needed

#### Drop Payload Panel
- **DROP PAYLOAD** button (red) — calls `triggerDrop()`
- **RESET HOOK** button (green) — calls `resetDrop()`
- Status indicator from `useDropStatus()`:
  - `idle` + `confirmed: true` → "Ready" (green)
  - `drop` + `confirmed: false` → "Dropping — Awaiting servo..." (amber pulse)
  - `idle` after confirm → "Dropped & Reset" (green)

#### Mission Dispatch Panel
- Click threat on map → "DISPATCH DRONE" button with threat coords pre-filled
- Or manual coordinate input: lat, lng, alt, speed
- **DISPATCH** button — calls `dispatchMission([{lat, lng, alt}], speed)`
- **ABORT** button — calls `abortMission()`
- Real-time status from `useMissionStatus()`:
  - `pending` → "Queued — Waiting for drone..." (yellow)
  - `executing` → "In Flight — {droneMessage}" (blue pulse)
  - `completed` → "Mission Complete" (green)
  - `failed` → "Failed: {droneMessage}" (red)
  - `aborted` → "Aborted" (grey)

### 5. Environment Variables

Already configured in `.env`:
```
VITE_FIREBASE_API_KEY=AIzaSyAwwMxE85lbjFjGRwMGvYvvt83v9qgrT7Y
VITE_FIREBASE_AUTH_DOMAIN=zero-strike.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=zero-strike
VITE_FIREBASE_STORAGE_BUCKET=zero-strike.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=914032390324
VITE_FIREBASE_APP_ID=1:914032390324:web:26bde870f9b7e7d6e5a7e1
VITE_FIREBASE_MEASUREMENT_ID=G-EGS2K7FXH6
```

---

## ESP32 Firmware

- Polls `GET /api/drop-status` every 1s via HTTPS
- On `"drop"` → moves servo to 180° → confirms via `POST /api/drop-confirm`
- On `"reset"` → moves servo to 0° → confirms
- Local web UI on port 80 for manual control
- WiFi: phone hotspot (needs internet access)

### Flash

```bash
cd C:\Users\asjos\Documents\PlatformIO\Projects\260221-194505-denky32
pio run --target upload
```

---

## Android App (WildBridge)

- Firestore listener in `VirtualStickFragment` watches `missions/current`
- When `status: "pending"` → executes mission via `DroneController`
- Supports both DJI native KMZ missions and virtual stick control
- Updates `droneStatus` and `droneMessage` back to Firestore in real-time
- No network dependency between phone and backend — works via Firestore

### Build & Install

Open `android-sdk-v5-as` in Android Studio, build and install the `sample` module.
