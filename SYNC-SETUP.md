# Setting up phone sync (5 minutes)

The app works fully offline on this PC right now — sync just adds a copy of your
data in the cloud so your phone sees the same schedule. It's free and takes a
few clicks.

## 1. Create a Firebase project
1. Go to https://console.firebase.google.com and sign in with any Google account.
2. Click **Add project**, name it something like `holform-os`, and finish the wizard
   (you can decline Google Analytics — not needed).

## 2. Turn on Firestore (the database)
1. In the left sidebar, click **Build → Firestore Database**.
2. Click **Create database**, choose a region close to you, and start in
   **production mode**.
3. Once created, go to the **Rules** tab and replace the contents with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
   Click **Publish**. This makes sure only you (signed in) can read or write your data.

## 3. Turn on sign-in
1. In the left sidebar, click **Build → Authentication**.
2. Click **Get started**, then enable the **Email/Password** provider, then Save.

## 4. Get your config and paste it in
1. Click the gear icon → **Project settings**.
2. Scroll to **Your apps**, click the **</>** (web) icon to register a new web app
   (any nickname is fine, no need for hosting).
3. Copy the `firebaseConfig` object it shows you.
4. Open [js/firebase-config.js](js/firebase-config.js) in this folder and paste the values in, e.g.:
   ```js
   const FIREBASE_CONFIG = {
     apiKey: "AIza...",
     authDomain: "holform-os.firebaseapp.com",
     projectId: "holform-os",
     storageBucket: "holform-os.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123",
   };
   ```
5. Save the file and reload the app. The badge next to the season toggle should
   now say **Sync: off** instead of **Sync: not set up**.

## 5. Sign in
1. Click the **Sync: off** badge, then **Create Account** with any email + a
   password (this doesn't need to be a real inbox — it's just your private login).
2. On your phone, open the same app URL, tap the same badge, and **Sign In**
   with that same email + password.
3. Both devices now read and write the same schedule in real time.

## Getting the app onto your phone

Right now the app only lives as files on this PC, so your phone can't reach it
yet — the files need to be hosted somewhere on the web first (free). Once that's
done, open the hosted URL on your phone's browser and use "Add to Home Screen"
(Safari) or the install prompt (Chrome) to make it behave like a real app icon.
Ask your assistant to help you pick a free host (GitHub Pages is the simplest
if you have a GitHub account) once you're ready for this step.
