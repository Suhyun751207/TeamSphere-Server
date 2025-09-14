// src/firebase.ts
import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";

import serviceAccount from "../../firebase-adminsdk-fbsvc-8a94f50787.json"; // JSON 키 import

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  storageBucket: "teamsphere-ae765.firebasestorage.app", // Firebase Storage 버킷 이름
});

const bucket = admin.storage().bucket();

export default bucket;
