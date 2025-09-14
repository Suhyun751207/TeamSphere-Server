// src/firebase.ts
import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS!); // JSON 키 import

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "teamsphere-ae765.firebasestorage.app", // Firebase Storage 버킷 이름
});

const bucket = admin.storage().bucket();

export default bucket;
