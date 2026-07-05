# Dungeon Core: First Floor

A browser-based dungeon management prototype. Claim adjacent tiles on a 7×7 grid, spend mana and stone to expand your domain, and persist progress with Firebase.

## Tech Stack

- React + Vite + TypeScript
- Firebase Authentication (anonymous)
- Cloud Firestore (save/load)
- Netlify deployment

## Prerequisites

- Node.js 18+
- A Firebase project with **Anonymous Authentication** and **Cloud Firestore** enabled

## Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Register a **Web app** and copy the SDK config values.
3. Enable **Authentication → Sign-in method → Anonymous**.
4. Create a **Cloud Firestore** database (start in test mode for local dev, then add rules for production).
5. Recommended Firestore rules for a single dungeon per user:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /dungeons/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase web app config:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |

## Local Development

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

Without Firebase configured, the app runs in **Demo Mode** and saves progress to `localStorage` in your browser. Configure Firebase in `.env` when you are ready for cloud saves and Netlify deployment.

## Launch from Windows

- **Double-click `Launch Dungeon Core.bat`** in the project root to start the dev server. It runs from the folder where the `.bat` file lives, installs dependencies if needed, starts Vite with `--open`, and keeps the terminal open so you can see errors.
- The browser should open automatically to `http://localhost:5173`. If it does not, open that URL manually.
- Without Firebase configured, the game runs in **Demo Mode** with local browser saves. Use the **Firebase setup** link in the demo banner when you are ready to enable cloud saves.
- **Run `Create Desktop Shortcut.ps1` once** to create or update a desktop shortcut named **Dungeon Core First Floor** that points to the launcher.
- Stop the server with **Ctrl+C** in the terminal window.

## Build

```bash
npm run build
npm run preview
```

## Netlify Deploy

1. Push the repo to GitHub (or connect your Git provider in Netlify).
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add the same `VITE_FIREBASE_*` environment variables in Netlify site settings.

`netlify.toml` is included with SPA redirect support.

## Milestone 1 Scope

- 7×7 claim grid with core (center) and entrance (top-center)
- Resource management (mana, stone, turn)
- Adjacent tile claiming with costs
- Anonymous auth + Firestore persistence
- Dungeon log and tile details panel

**Not included:** combat, monsters, traps, multiple floors, skill trees, adventurer invasions.

## Project Structure

```
src/
  app/App.tsx
  features/
    auth/useAnonymousAuth.ts
    dungeon/
      dungeonTypes.ts
      dungeonGeneration.ts
      dungeonRules.ts
      DungeonPage.tsx
      DungeonGrid.tsx
      TileDetailsPanel.tsx
      ResourceBar.tsx
      DungeonLog.tsx
  services/
    dungeon/
      dungeonRepository.ts
    demo/
      demoDungeonRepository.ts
    firebase/
      firebaseApp.ts
      firebaseConfig.ts
      firebaseDungeonRepository.ts
  features/
    demo/
      DemoModeBanner.tsx
  main.tsx
```

## Game Rules (Summary)

- Grid: 7×7
- Core at (3, 3), entrance at (3, 0) — both start claimed
- Claim cost: 10 mana + 5 stone
- Starting resources: 100 mana, 50 stone
- Each claim advances turn and grants +5 mana
- Only hidden tiles adjacent to claimed tiles can be claimed
- Blocked tiles cannot be claimed
