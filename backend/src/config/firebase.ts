import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables immediately to resolve import race conditions
dotenv.config({ path: path.join(__dirname, '../../.env') });

let firestoreDb: admin.firestore.Firestore | null = null;
let realtimeDb: admin.database.Database | null = null;
let isFirebaseInitialized = false;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Replace standard escaped newline characters in string
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      }),
      databaseURL
    });
    
    firestoreDb = admin.firestore();
    realtimeDb = admin.database();
    isFirebaseInitialized = true;
    console.log('Firebase Admin SDK successfully connected.');
  } else {
    console.log('Firebase credentials incomplete. Running in standalone local JSON mode.');
  }
} catch (err) {
  console.error('Failed to initialize Firebase Admin SDK. Falling back to local JSON database mode.', err);
}

export { firestoreDb, realtimeDb, isFirebaseInitialized };
