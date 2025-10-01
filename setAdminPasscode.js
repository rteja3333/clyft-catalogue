// Usage: node setAdminPasscode.js <your-passcode>
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// You must set GOOGLE_APPLICATION_CREDENTIALS env var to your Firebase service account key JSON
initializeApp({ credential: applicationDefault() });
const db = getFirestore();

async function hashPasscode(passcode) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(passcode).digest('hex');
}

async function setPasscode(passcode) {
  const hash = await hashPasscode(passcode);
  await db.doc('admin/passcode').set({ hash });
  console.log('Admin passcode hash set in Firestore.');
}

const passcode = process.argv[2];
if (!passcode) {
  console.error('Usage: node setAdminPasscode.js <your-passcode>');
  process.exit(1);
}
setPasscode(passcode);
