# zerostrike

## Project structure

- **frontend/** — Vite-based static app; build output is deployed to Firebase Hosting.
- **backend/** — Firebase Cloud Functions (Node.js 20).

## Firebase deployment

### Prerequisites

- Node.js 20+
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- A [Firebase project](https://console.firebase.google.com/)

### One-time setup

1. Log in: `firebase login`
2. Set your project: replace `your-firebase-project-id` in `.firebaserc` with your Firebase project ID, or run:
   ```bash
   firebase use your-firebase-project-id
   ```

### Deploy

1. Install and build frontend:
   ```bash
   cd frontend && npm install && npm run build && cd ..
   ```
2. Install backend dependencies:
   ```bash
   cd backend && npm install && cd ..
   ```
3. Deploy Hosting + Functions:
   ```bash
   firebase deploy
   ```
   Or deploy only hosting or only functions:
   ```bash
   firebase deploy --only hosting
   firebase deploy --only functions
   ```

### Local development

- Frontend: `cd frontend && npm run dev`
- Functions emulator: from project root, `firebase emulators:start --only functions`