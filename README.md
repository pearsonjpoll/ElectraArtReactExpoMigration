# Employee App Expo

Expo/React Native port of the existing Flutter employee app.

## GitHub + Expo Ready Setup

This folder is set up to be uploaded as its own GitHub repo and then connected to Expo/EAS.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your Supabase values:

```bash
Copy-Item .env.example .env
```

3. Start Expo:

```bash
npm run start
```

The app reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
through [app.config.ts](/C:/Users/Pearson%20Pollard/Documents/New%20project/employee_app/expo_app/app.config.ts).

## Upload to GitHub

If you want this Expo app to be the repo root, upload the contents of this folder as a new GitHub repository.

If you want to keep the Flutter app alongside it, you can also keep this as a subfolder repo source, but Expo/EAS is simplest when this folder is the project root.

## Connect to Expo

1. Create a GitHub repo from this folder.
2. In Expo/EAS, create a new project and connect that repo.
3. Add these environment variables in Expo:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

4. Run your first hosted build:

```bash
eas build --platform android
```

or

```bash
eas build --platform ios
```

This repo already includes [eas.json](/C:/Users/Pearson%20Pollard/Documents/New%20project/employee_app/expo_app/eas.json) for standard development, preview, and production profiles.

## Feature parity

This port preserves the current Flutter app flow:

- Supabase sign-in and session persistence
- request list with status filter
- request detail view
- assign-to-me and status update actions through `update-request`
